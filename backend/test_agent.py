from agent import extract_credit_request, simular_credito_auto


def test_extract_credit_request_from_auto_prompt():
    result = extract_credit_request("Quiero un crédito auto de 350000 a 48 meses")
    assert result["monto"] == 350000
    assert result["plazo_meses"] == 48


def test_simular_credito_auto_values():
    result = simular_credito_auto(300000, 36)
    assert result["monto_solicitado"] == 300000
    assert result["plazo_meses"] == 36
    assert result["tasa_anual_porcentaje"] == 12.5
    assert result["pago_mensual_estimado"] > 0
    assert result["costo_total_estimado"] > result["monto_solicitado"]
