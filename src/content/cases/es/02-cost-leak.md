---
order: 2
roleId: mindfortress-inc
organisation: MindFortress
role: Tech Lead
title: Encontrar el gasto de IA que nadie sabía explicar
summary: Una partida de gasto sin dueño consumía $12–16 al día. La rastreé hasta su origen, entregué una protección para que no se repita y verifiqué $0 en el ledger de producción.
before: $15/día
after: $0
stack: [Python, Ledger de costes, Análisis de causa raíz]
keywords: [coste, gasto, fuga, dinero, ledger, producción, depuración]
---

<h2 id="problem">Problema</h2>

Como Technical Lead en MindFortress llevaba las operaciones en producción de dos productos de IA, incluido el ledger de costes de su gasto en IA. Una partida de ese ledger no tenía dueño: $12–16 al día, de forma crónica, que ninguna funcionalidad justificaba.

Una fuga de ese tamaño es fácil de tolerar. También es señal de que algo en producción está haciendo un trabajo que nadie pidió, y sea lo que sea, no se va a quedar pequeño por sí solo.

<h2 id="approach">Enfoque</h2>

Lo traté como un bug con un número asociado. En lugar de adivinar adónde podía ir el dinero, seguí el gasto no atribuido hacia atrás hasta llegar a su origen: un worker en segundo plano obsoleto que no debería haber estado haciendo esas llamadas.

Pararlo una vez no habría sido un arreglo, porque las condiciones que lo originaron podían volver. Así que entregué una protección en el código para que la misma situación no se repita, y después comprobé el resultado donde importa: en el ledger de producción, no en el código.

<h2 id="result">Resultado</h2>

El gasto no atribuido pasó de unos $12–16 al día a $0, verificado en el ledger de producción y no supuesto.

La protección convierte un coste silencioso y recurrente en un fallo que se vería de inmediato. El hábito de fondo es el que aplico a cualquier sistema de IA que llevo: el gasto es una métrica como la latencia, y un número que nadie sabe explicar es un incidente esperando nombre.
