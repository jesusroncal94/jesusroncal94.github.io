---
order: 1
roleId: intercorp-management-innova-latam
organisation: Intercorp
role: AI Engineer
title: 'Evals antes que sensaciones: arreglar un prompt que se desviaba'
summary: Fixtures con LLM-as-judge en 5 dimensiones y 19 ítems convirtieron cada cambio de prompt en un gate de release medido. Los tokens de salida bajaron ~71 % en los casos inflados.
before: 45,6 %
after: 100 %
stack: [Gemini 2.5 Pro, Spring AI, LLM-as-judge]
keywords: [evals, prompt, calidad, tokens, gemini, planes de clase, proceso de evaluación]
---

<h2 id="problem">Problema</h2>

Soy responsable del sistema LLM en producción que genera planes de clase alineados al currículo para docentes de Perú, Colombia y México, sobre Gemini 2.5 Pro a través de Vertex AI. Un plan de clase solo sirve si sigue la estructura que define su currículo nacional, sección por sección.

Medido contra esa estructura, solo el 45,6 % de las respuestas cumplía. Algunas además venían infladas, gastando tokens en texto que nadie había pedido. La cura no es un prompt que suene mejor. Es una forma de medirlo.

<h2 id="approach">Enfoque</h2>

Construí un conjunto de fixtures de prueba y una rúbrica LLM-as-judge que puntúa cada respuesta en 5 dimensiones y 19 ítems. Ahora cada cambio de prompt produce un número que se puede comparar con el anterior, en lugar de una impresión.

Los prompts pasaron a ser artefactos con versionado semántico, así que un cambio es un release con número y no una edición sobre la marcha. En el mismo sistema, el motor de generación de unidades que entregué deja fuera del modelo las comprobaciones que no lo necesitan: guardrails deterministas validan la estructura y detectan respuestas truncadas sin una sola llamada extra al LLM. Y cada llamada reporta sus tokens, su coste y su latencia, así que un cambio que mejora la calidad pero duplica la factura se ve en el dashboard antes de convertirse en una sorpresa.

<h2 id="result">Resultado</h2>

La conformidad estructural pasó del 45,6 % al 100 %, y los tokens de salida bajaron cerca de un 71 % en los casos que venían inflados.

El cambio duradero está en cómo se publican los prompts. Una nueva versión es un release medido y no una opinión: los fixtures dicen si es mejor, y los dashboards, cuánto cuesta.
