# backend/main.py
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from fastapi.responses import JSONResponse
import uvicorn
import os
import numpy as np
from PIL import Image
from io import BytesIO
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Inisialisasi FastAPI
app = FastAPI(
    title="Pic a Fruit API",
    description="AI-powered fruit freshness detection API",
    version="1.0.0"
)

# Setup CORS - izinkan akses dari frontend React Native
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Dalam production, batasi ke domain specific
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables untuk model
model = None
CLASS_NAMES = [
    "freshapples", "freshbanana", "freshoranges", "freshrambutan", 
    "rottenapples", "rottenbanana", "rottenoranges", "rottenrambutan", 
    "unripe apple", "unripe banana", "unripe oranges", "unripe rambutan"
]

# Target size untuk input model (sesuaikan dengan model Anda)
TARGET_SIZE = (224, 224)

def load_ai_model():
    """Load model AI saat startup"""
    global model
    try:
        # Coba import tensorflow
        try:
            import tensorflow as tf
            from tensorflow.keras.models import load_model
            
            # Cek apakah file model ada
            model_path = "./model/cnnVGG16rv2.h5"
            if os.path.exists(model_path):
                logger.info(">> Loading AI model...")
                model = load_model(model_path)
                logger.info(">> AI Model loaded successfully")
                return True
            else:
                logger.warning(f">> Model file not found: {model_path}")
                logger.warning(">> Running in demo mode without AI model")
                return False
                
        except ImportError:
            logger.warning(">> TensorFlow not found, running in demo mode")
            return False
            
    except Exception as e:
        logger.error(f">> Error loading model: {str(e)}")
        return False

def preprocess_image(image: Image.Image) -> np.ndarray:
    """Preprocess image untuk input ke model"""
    try:
        # Convert ke RGB jika belum
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize ke target size
        image = image.resize(TARGET_SIZE)
        
        # Convert ke array numpy
        img_array = np.array(image)
        
        # Expand dimensions untuk batch
        img_array = np.expand_dims(img_array, axis=0)
        
        # Normalize pixel values (0-1)
        img_array = img_array.astype(np.float32) / 255.0
        
        return img_array
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error preprocessing image: {str(e)}")

def simulate_prediction() -> dict:
    """Simulasi prediksi untuk demo mode"""
    import random
    
    # Pilih random dari class names
    random_class = random.choice(CLASS_NAMES)
    confidence = random.uniform(0.75, 0.95)  # Random confidence 75-95%
    
    return {
        "predicted_class": random_class,
        "confidence": confidence,
        "demo_mode": True
    }

@app.on_event("startup")
async def startup_event():
    """Event yang dijalankan saat startup"""
    logger.info(">> Starting Pic a Fruit API...")
    load_ai_model()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Pic a Fruit API is running!",
        "status": "healthy",
        "model_loaded": model is not None,
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "model_status": "loaded" if model is not None else "not_loaded",
        "demo_mode": model is None,
        "supported_classes": CLASS_NAMES
    }

@app.post("/predict")
async def predict_fruit(file: UploadFile = File(...)):
    """Main prediction endpoint"""
    try:
        # Validasi file
        if not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400, 
                detail="File harus berupa gambar (jpg, png, dll)"
            )
        
        logger.info(f">> Processing image: {file.filename}")
        contents = await file.read()
        
        try:
            image = Image.open(BytesIO(contents))
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Gagal membaca gambar: {str(e)}"
            )
        
        # Jika model tersedia, gunakan AI prediction
        if model is not None:
            try:
                # Preprocess image
                processed_image = preprocess_image(image)
                
                # Prediction
                predictions = model.predict(processed_image, verbose=0)
                predicted_index = np.argmax(predictions[0])
                confidence = float(np.max(predictions[0]))
                
                # Validasi confidence threshold
                if confidence < 0.6:  # 
                    return JSONResponse({
                        "status": "error",
                        "label": "Confidence terlalu rendah",
                        "confidence": confidence,
                        "message": "Gambar tidak dapat dikenali dengan yakin. Coba ambil foto yang lebih jelas."
                    })
                
                predicted_label = CLASS_NAMES[predicted_index]
                
                logger.info(f">> Prediction: {predicted_label} (confidence: {confidence:.2f})")
                
                return JSONResponse({
                    "status": "success",
                    "label": predicted_label,
                    "confidence": confidence,
                    "model_version": "cnnVGG16rv2",
                    "demo_mode": False
                })
                
            except Exception as e:
                logger.error(f">> Prediction error: {str(e)}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Error saat melakukan prediksi: {str(e)}"
                )
        
        # Jika model tidak tersedia, gunakan demo mode
        else:
            logger.info(">> Running in demo mode")
            demo_result = simulate_prediction()
            
            return JSONResponse({
                "status": "success",
                "label": demo_result["predicted_class"],
                "confidence": demo_result["confidence"],
                "demo_mode": True,
                "message": "Running in demo mode - place your AI model file (cnnVGG16rv2.h5) in backend folder for real AI predictions"
            })
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f">> Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Server error: {str(e)}"
        )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )