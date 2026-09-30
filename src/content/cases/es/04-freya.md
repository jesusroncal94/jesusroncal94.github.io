---
order: 4
roleId: mindfortress-inc
organisation: MindFortress
product: Freya
role: Tech Lead
title: Un compañero de escritura que nunca pierde el hilo
summary: Siete agentes especializados junto a un motor de consistencia basado en un grafo de conocimiento con seguimiento epistémico, más coedición en tiempo real sobre CRDTs, en un backend FastAPI con más de 800 endpoints.
before: 7 agentes
after: 1 grafo narrativo
stack: [FastAPI, pgvector, Yjs / CRDT]
keywords: [freya, agentes, multiagente, grafo de conocimiento, arquitectura, crdt, escritura]
---

<h2 id="problem">Problema</h2>

Freya es un compañero de escritura con IA para novelistas. Una novela es larga, y los hechos que la sostienen están repartidos en cientos de páginas. Un compañero de escritura que pierde la pista de cualquiera de ellos se convierte en una cosa más que el autor tiene que revisar.

Eso hace de la consistencia el requisito central, no una funcionalidad: cada sugerencia tiene que concordar con el libro hasta ese punto.

<h2 id="approach">Enfoque</h2>

Diseñé la capa de IA de Freya en torno a un único motor de consistencia para la historia.

En su centro hay un grafo de conocimiento con 33 tipos de aristas y, por encima, seguimiento epistémico. Siete agentes especializados trabajan junto a ese motor.

Escribir es colaborativo, así que el editor también. La coedición en tiempo real funciona con CRDTs de Yjs sobre WebSocket, lo que permite fusionar cambios concurrentes sin conflictos. Por debajo hay un backend FastAPI con más de 800 endpoints y pgvector, que integra modelos de Claude (Sonnet y Opus) y de OpenAI.

<h2 id="result">Resultado</h2>

Siete agentes, un grafo narrativo y un editor en el que varias personas pueden escribir a la vez: la arquitectura de la capa de IA de Freya.

Son las decisiones de diseño que volvería a tomar para cualquier asistente que deba mantenerse consistente a lo largo de un documento extenso: un grafo con relaciones tipadas en el centro y agentes especializados con roles acotados a su alrededor.
