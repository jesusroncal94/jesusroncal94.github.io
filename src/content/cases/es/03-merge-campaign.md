---
order: 3
roleId: mindfortress-inc
organisation: MindFortress
product: Reeve
role: Tech Lead
title: 112 PR a producción en 30 horas
summary: Agentes de Claude Code en paralelo, cada uno en su worktree aislado, hicieron rebase de la cola y la apilaron en 4 repos; un gate serial sin fallos nuevos decidió qué se fusionaba.
before: 112 en cola
after: '0'
stack: [Claude Code, GitHub Actions, pytest]
keywords: [agentes, claude code, merge, pull requests, ci, release, reeve]
---

<h2 id="problem">Problema</h2>

Reeve es una plataforma de crecimiento para comercio con IA, y su MVP esperaba en una cola de 112 pull requests repartidos en 4 repositorios. Yo era responsable de la revisión de código y del control de releases, así que vaciar esa cola era mi trabajo, sin dejar que la velocidad rebajara el listón de lo que llega a producción.

Una cola de ese tamaño se estorba a sí misma. Cada merge mueve la base bajo los pull requests que vienen detrás, y el CI necesitaba su propio trabajo antes de que un build en verde fuera fiable.

<h2 id="approach">Enfoque</h2>

Dividí el trabajo en dos: preparación en paralelo, admisión en serie.

La preparación fue en paralelo. Cada agente de Claude Code trabajó en su propio git worktree aislado, así que nunca se pisaron entre sí. Hicieron rebase de los pull requests por contenido y agruparon los cambios dependientes en cadenas apiladas que podían entrar en orden.

La admisión siguió siendo serial. Cada pull request pasó un gate sin fallos nuevos antes de fusionarse: la suite de tests no podía quedar peor de lo que estaba antes del merge. Por el camino desbloqueé el propio CI, dividiendo la suite en shards y arreglando los tests que dependían de su entorno, para que un build en rojo significara un problema real.

<h2 id="result">Resultado</h2>

Los 112 pull requests pasaron de la cola a producción en unas 30 horas. Los agentes aportaron el rendimiento; el gate serial, la seguridad.

Es la misma división del trabajo que usaba a diario en MindFortress para el control de releases: 6–8 pull requests por sesión a producción, cada uno tras pasar gates empíricos previos al merge (tests, comprobación de tipos y replays de migraciones).
