# Cómo desplegar en Render

Sigue estos pasos para subir tu aplicación a internet usando Render.com.

## 1. Código Actualizado
El código ya ha sido subido a GitHub con los archivos de configuración necesarios (`render.yaml`).

## 2. Crear cuenta en Render
Ve a [https://render.com/](https://render.com/) y crea una cuenta (puedes usar tu GitHub).

## 3. Crear Nuevo Web Service (Blueprints)
1.  En el Dashboard de Render, haz clic en **"New +"** y selecciona **"Blueprint"**.
2.  Conecta tu cuenta de GitHub y selecciona el repositorio `tensor-hubble`.
3.  Render detectará automáticamente el archivo `render.yaml`.
4.  Haz clic en **"Apply"** o **"Connect"**.

## 4. Configurar Variables de Entorno
Render te pedirá que ingreses los valores para las variables:

*   **MONGO_URI**: `mongodb+srv://jesus:jesus1234@jesus.v5ohws0.mongodb.net/tensor-hubble?appName=jesus`
*   **JWT_SECRET**: `secret_key_change_this`
*   **TELEGRAM_BOT_TOKEN**: `8452993365:AAFrRj5cCWTBUcTeouCHroS7OAWnz6PfC6Q`

## 5. Finalizar
Haz clic en **"Create Web Service"**.
