---
order: 4
roleId: mindfortress-inc
organisation: MindFortress
product: Freya
role: Tech Lead
title: Un compañero de escritura que nunca pierde el hilo
summary: Co-diseñé la arquitectura de un compañero de escritura con IA en torno a un modelo en "reloj de arena" (muchos canales de entrada, una única base de conocimiento solo con hechos, generación de prosa) y preparé su capa de IA para producción.
before: 7 agentes
after: 1 grafo narrativo
stack: [FastAPI, pgvector, Yjs / CRDT]
keywords: [freya, agentes, multiagente, grafo de conocimiento, arquitectura, crdt, escritura, reloj de arena]
---

<h2 id="problem">Problema</h2>

Freya es un compañero de escritura con IA para novelistas. Una novela es larga, y los hechos que la sostienen están repartidos en cientos de páginas. Un compañero de escritura que pierde la pista de cualquiera de ellos se convierte en una cosa más que el autor tiene que revisar.

Eso hace de la consistencia el requisito central, no una funcionalidad: cada sugerencia tiene que concordar con el libro hasta ese punto.

<h2 id="approach">Enfoque</h2>

Como Technical Lead, co-diseñé la capa de IA de Freya y escribí su modelo de arquitectura, el "reloj de arena": muchas entradas, una sola fuente de verdad y prosa a la salida.

El autor alimenta la historia por varios canales: creación por voz, preguntas guiadas, entrevistas con personajes e importación de manuscritos. Unos subagentes de entrada extraen, resumen y estructuran lo que llega, y el resultado va a una única base de conocimiento que solo guarda hechos. La generación de prosa se apoya en esa base. Unos subagentes de salida generan, validan y enriquecen el resultado, y así se cierra el ciclo.

El equipo construyó la plataforma sobre ese modelo:

- siete agentes de chat especializados con recuperación sobre la biblia de la historia;
- un pipeline de guardas tras cada generación;
- un grafo de conocimiento con 33 tipos de relación, incluido el seguimiento epistémico de "quién sabe qué";
- coedición en tiempo real con CRDTs de Yjs sobre WebSocket.

Por debajo hay un backend FastAPI con más de 900 endpoints, más de 180 modelos de datos y pgvector, que integra modelos de Claude (Sonnet y Opus) y de OpenAI.

Mi propio código hizo que esa capa aguantara en producción:

- un único enrutador de modelos para todos los agentes, con enrutamiento consciente de las políticas de contenido;
- aislamiento y autorización por proyecto en las consultas de chat y de manuscritos;
- errores de streaming saneados;
- seguimiento real de tokens y costes en streaming;
- las llamadas de IA bloqueantes, fuera del event loop.

<h2 id="result">Resultado</h2>

Muchas entradas, un único almacén de hechos y prosa a la salida: la forma sobre la que se construyó la capa de IA de Freya, lista para producción.

Volvería a tomar la misma decisión para cualquier asistente que deba mantenerse consistente a lo largo de un documento extenso: una cintura estrecha. Sea cual sea la entrada, primero se convierte en hechos, y la generación solo lee de ellos.
