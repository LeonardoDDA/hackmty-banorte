import os
import re
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

try:
    from google import genai
    from google.genai import types
except Exception:  # pragma: no cover
    genai = None
    types = None

load_dotenv()

app = FastAPI(title="Banorte Generative UI Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.getenv("GEMINI_API_KEY")
client = None
if genai is not None and API_KEY:
    try:
        client = genai.Client(api_key=API_KEY)
    except Exception as exc:  # pragma: no cover
        print(f"⚠️ No se pudo inicializar Gemini: {exc}")
        client = None


def simular_credito_auto(monto: float, plazo_meses: int = 36) -> dict:
    monto = max(float(monto), 0.0)
    plazo_meses = max(int(plazo_meses), 1)
    tasa_anual = 0.125
    tasa_mensual = tasa_anual / 12
    pago_mensual = (monto * tasa_mensual) / (1 - (1 + tasa_mensual) ** -plazo_meses)
    costo_total = pago_mensual * plazo_meses
    return {
        "monto_solicitado": float(monto),
        "plazo_meses": int(plazo_meses),
        "tasa_anual_porcentaje": 12.5,
        "pago_mensual_estimado": round(pago_mensual, 2),
        "costo_total_estimado": round(costo_total, 2),
    }


def detect_credit_intent(prompt: str) -> str:
    clean_prompt = (prompt or "").lower()
    if any(word in clean_prompt for word in ["refinanciamiento", "refinanciar", "refinance"]):
        return "refinanciamiento"
    if any(word in clean_prompt for word in ["amortizacion", "amortización", "tabla de amortizacion", "tabla de amortización"]):
        return "amortizacion"
    if any(word in clean_prompt for word in ["precalificacion", "precalificación", "precalificado", "cuanto me pueden prestar", "cuánto me pueden prestar"]):
        return "precalificacion"
    return "general"


def detect_ui_intent(prompt: str) -> str:
    clean_prompt = (prompt or "").lower()

    info_keywords = [
        "qué es un crédito", "que es un credito", "qué es el buró", "que es el buro",
        "buró de crédito", "buro de credito", "como puedo mejorar mi puntaje",
        "cómo puedo mejorar mi puntaje", "qué costos", "que costos", "cómo funciona",
        "cómo funciona un crédito", "como funciona un credito", "qué debo hacer",
        "que debo hacer", "explicame", "explica", "requisitos", "proceso", "pasos",
        "servicio", "solicitar", "ayuda", "qué es", "que es"
    ]
    guidance_keywords = [
        "como funciona", "cómo funciona", "que debo hacer", "qué debo hacer", "como puedo", "cómo puedo",
        "requisitos", "proceso", "pasos", "explicame", "explica", "ayuda", "servicio", "solicitar"
    ]
    credit_keywords = [
        "credito", "crédito", "prestamo", "préstamo", "simulacion", "simulación", "cotizacion", "cotización",
        "auto", "automotriz", "moto", "motocicleta", "financiamiento", "pago mensual", "meses", "monto"
    ]

    if any(keyword in clean_prompt for keyword in info_keywords):
        return "guidance"
    if any(keyword in clean_prompt for keyword in guidance_keywords):
        return "guidance"
    if any(keyword in clean_prompt for keyword in credit_keywords):
        return "credit"
    return "general"


def extract_credit_request(prompt: str) -> dict[str, Any]:
    clean_prompt = (prompt or "").lower()
    monto_match = re.search(r"(\d{1,3}(?:[.,]\d{3})+|\d+(?:[.,]\d+)?)", clean_prompt)
    plazo_match = re.search(r"(\d{1,3})\s*(?:mes(?:e|es)|months?)", clean_prompt)
    keyword_match = re.search(
        r"(?:credito|crédito|prestamo|préstamo|simulaci[oó]n|cotizaci[oó]n|auto|automotriz|moto|motocicleta|veh[íi]culo|financiamiento|general|precalificaci[oó]n|amortizaci[oó]n|refinanciamiento|refinanciar)",
        clean_prompt,
    )

    monto = 300000.0
    plazo = 36

    if monto_match:
        monto_text = monto_match.group(1).replace(",", "")
        try:
            monto = float(monto_text)
        except ValueError:
            monto = 300000.0

    if plazo_match:
        try:
            plazo = int(plazo_match.group(1))
        except ValueError:
            plazo = 36

    return {
        "is_credit_request": bool(keyword_match),
        "monto": monto,
        "plazo_meses": plazo,
        "intencion": detect_credit_intent(prompt),
    }


class ChatRequest(BaseModel):
    prompt: str


@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        prompt = (request.prompt or "").strip()
        if not prompt:
            return {
                "message": "¡Hola! ¿En qué puedo ayudarte con tus necesidades financieras Banorte?",
                "render_ui": False,
                "component_name": None,
                "component_props": {},
            }

        ui_intent = detect_ui_intent(prompt)
        credit_data = extract_credit_request(prompt)

        if ui_intent == "guidance":
            info_title = "Proceso Banorte"
            info_highlight = "Te recomiendo empezar por una precalificación."
            if "qué es" in prompt.lower() or "que es" in prompt.lower():
                info_title = "¿Qué es un crédito?"
                info_highlight = "Un crédito es un préstamo de dinero que se devuelve en pagos periódicos con intereses."
            elif "buró" in prompt.lower() or "buro" in prompt.lower():
                info_title = "Buró de Crédito"
                info_highlight = "Tu historial crediticio ayuda a evaluar tu capacidad de pago y la tasa que podrías obtener."
            elif "puntaje" in prompt.lower():
                info_title = "Mejorar tu puntaje"
                info_highlight = "Pagar a tiempo, reducir deudas y mantener un uso responsable de crédito ayudan a mejorar tu perfil."
            elif "costos" in prompt.lower():
                info_title = "Costos adicionales"
                info_highlight = "Además de la tasa de interés, pueden existir comisiones, seguros y gastos de apertura."

            return {
                "message": "Te ayudo con esto de forma clara y visual. Aquí tienes la guía más útil para tu caso.",
                "render_ui": True,
                "component_name": "GuidanceCard",
                "component_props": {
                    "title": info_title,
                    "subtitle": "Lo que debes saber antes de continuar",
                    "steps": [
                        "1. Identifica si necesitas una simulación, precalificación o información general.",
                        "2. Revisa tus ingresos, gastos y capacidad de pago.",
                        "3. Compara tasas, plazo y costos antes de decidir.",
                        "4. Si quieres, puedo ayudarte a calcular una opción concreta."
                    ],
                    "cta": "Continuar con mi análisis",
                    "highlight": info_highlight
                },
            }

        if ui_intent == "credit" or credit_data["is_credit_request"]:
            result = simular_credito_auto(
                monto=credit_data["monto"],
                plazo_meses=credit_data["plazo_meses"],
            )

            intent = credit_data["intencion"]
            if intent == "precalificacion":
                message = (
                    f"Tu precalificación estimada para un crédito general de ${result['monto_solicitado']:,.2f} "
                    f"a {result['plazo_meses']} meses es un pago mensual aproximado de ${result['pago_mensual_estimado']:,.2f}."
                )
            elif intent == "amortizacion":
                message = (
                    f"Te muestro una proyección de amortización para un crédito general de ${result['monto_solicitado']:,.2f} "
                    f"con plazo de {result['plazo_meses']} meses. Tu pago mensual estimado es ${result['pago_mensual_estimado']:,.2f}."
                )
            elif intent == "refinanciamiento":
                message = (
                    f"Para tu refinanciamiento, la nueva estimación para un crédito general de ${result['monto_solicitado']:,.2f} "
                    f"a {result['plazo_meses']} meses quedaría en un pago mensual aproximado de ${result['pago_mensual_estimado']:,.2f}."
                )
            else:
                message = (
                    f"Con gusto te presento la cotización simulada para tu crédito general de ${result['monto_solicitado']:,.2f} "
                    f"a {result['plazo_meses']} meses."
                )

            return {
                "message": message,
                "render_ui": True,
                "component_name": "CreditSimulator",
                "component_props": {
                    **result,
                    "tipo_credito": intent,
                    "escenario": intent,
                },
            }

        if client is not None:
            try:
                system_instruction = """
                Eres un asistente financiero de Banorte. Tu objetivo es ayudar a los clientes con sus necesidades financieras de forma clara, amigable y visual.

                Reglas absolutas:
                - Si el usuario pregunta sobre conceptos generales, explica de forma breve y clara usando lenguaje financiero sencillo.
                - Si el usuario pide una simulación de crédito o monto/plazo, responde con un enfoque de cotización y usa una tarjeta visual resumida.
                - Los mensajes deben estar alineados con la identidad Banorte: cercano, profesional y útil.
                - No des respuestas vagas ni inventes cifras sin contexto.
                """
                response = client.models.generate_content(
                    model="gemini-3.5-flash-lite",
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                    ),
                )
                text_response = getattr(response, "text", None)
                if text_response:
                    return {
                        "message": text_response,
                        "render_ui": True,
                        "component_name": "GuidanceCard",
                        "component_props": {
                            "title": "Información financiera",
                            "subtitle": "Respuesta adaptada a tu pregunta",
                            "steps": [
                                "1. Entendimos tu consulta financiera.",
                                "2. Esta respuesta se ajusta a tu necesidad específica.",
                                "3. Si quieres, puedo convertirlo en una simulación más precisa.",
                                "4. Te ayudo a continuar con la siguiente decisión."
                            ],
                            "cta": "Quiero seguir",
                            "highlight": text_response[:140] + ("..." if len(text_response) > 140 else "")
                        },
                    }
            except Exception as exc:
                print(f"❌ ERROR DE GEMINI: {exc}")

        return {
            "message": "Puedo ayudarte con crédito general, precalificación, amortización y refinanciamiento. Si me dices el monto y el plazo, te preparo una simulación.",
            "render_ui": True,
            "component_name": "GuidanceCard",
            "component_props": {
                "title": "¿Qué puedo ayudarte a revisar?",
                "subtitle": "Aquí tienes opciones claras para avanzar",
                "steps": [
                    "1. Simulación de crédito con monto y plazo.",
                    "2. Precalificación para conocer tu capacidad de pago.",
                    "3. Explicación de costos, tasas o buró de crédito.",
                    "4. Refinanciamiento o amortización de una deuda."
                ],
                "cta": "Elegir una opción",
                "highlight": "Si me dices el monto y el plazo, puedo armar una propuesta clara y visual."
            },
        }

    except Exception as e:
        print(f"❌ ERROR EN EL BACKEND: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("agent:app", host="127.0.0.1", port=8000, reload=True)