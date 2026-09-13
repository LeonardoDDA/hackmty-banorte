import asyncio
from mcp.server.festmcp import FastMCP

mcp = FastMcp("Banorte-Financial-Servicies")

@mcp.tool()
def simular_credito_auto(monto: float, plazo_meses: int = 36)-> dict:
    """
    Calcula la estimacion de un credito automotriz Banorte.
    Retorna la tasa de interes suguerida, la mensualidad y el costo total.

    paramters:
        monto: El valor solicitado del credito en MXN (ej: 250000).
        plazo_meses: Plazo de paga en meses (12, 24, 36, 48, 60).
    """

    tasa_anual = 0.125;
    tasa_mensual = tasa_anual / 12;

    pago_mensual = (monto * tasa_mensual) / (1 - (1 + tasa_mensual) ** -plazo_meses)
    costo_total = pago_mensual * plazo_meses

    return {
        "monto_solicitado": monto,
        "plazo_meses": plazo_meses,
        "tasa_anual_porcentaje": 12.5,
        "pago_mensual_estimado": round(pago_mensual, 2),
        "costo_total_estimado": round(costo_total, 2),
        "status": "Aprobado preliminarmente"
    }

@mcp.tool()
def consultar_score_cliente(clinete_id: str) -> dict:
    """
    Obtiene el historial crediticio y score simulado de un cliente Banorte.
    """
    return{
        "cliente_id": clinete_id,
        "score_buromexico": 745,
        "riesgo": "Bajo",
        "preaprobado_auto_credito": True,
        "linea_credito_maxima": 500000.00
    }

if __name__ == "__main__":
    mcp.run()

