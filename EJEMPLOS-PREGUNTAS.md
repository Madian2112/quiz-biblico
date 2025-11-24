# 📝 Ejemplos de Preguntas para Agregar

Este archivo contiene ejemplos de SQL para agregar más preguntas a tu quiz bíblico.

## 🎯 Formato de Preguntas

Cada pregunta debe tener:
- **tema_id**: ID del tema (Historia, Personajes, etc.)
- **libro**: Nombre del libro bíblico
- **capitulo**: UN SOLO capítulo (número entero)
- **texto_pregunta**: La pregunta
- **respuesta_correcta**: La respuesta
- **nivel_dificultad**: 'fácil', 'medio' o 'difícil'
- **versiculo_especifico**: Referencia bíblica (opcional)
- **metadata**: Datos adicionales en formato JSON (opcional)

## 📚 Ejemplos por Tema

### Historia

```sql
INSERT INTO preguntas (tema_id, libro, capitulo, texto_pregunta, respuesta_correcta, nivel_dificultad, versiculo_especifico) VALUES
((SELECT id FROM temas WHERE nombre = 'Historia'), 
'Génesis', 
1, 
'¿Cuántos días tomó la creación del mundo?',
'Seis días, y el séptimo descansó',
'fácil',
'Génesis 1:1-2:3'),

((SELECT id FROM temas WHERE nombre = 'Historia'), 
'Éxodo', 
14, 
'¿Qué hizo Dios para que los israelitas cruzaran el Mar Rojo?',
'Dividió las aguas del mar',
'fácil',
'Éxodo 14:21-22'),

((SELECT id FROM temas WHERE nombre = 'Historia'), 
'Génesis', 
6, 
'¿Cuánto tiempo llovió durante el diluvio?',
'Cuarenta días y cuarenta noches',
'medio',
'Génesis 7:12');
```

### Personajes

```sql
INSERT INTO preguntas (tema_id, libro, capitulo, texto_pregunta, respuesta_correcta, nivel_dificultad, versiculo_especifico) VALUES
((SELECT id FROM temas WHERE nombre = 'Personajes'), 
'Génesis', 
37, 
'¿Quién fue vendido por sus hermanos como esclavo?',
'José',
'fácil',
'Génesis 37:28'),

((SELECT id FROM temas WHERE nombre = 'Personajes'), 
'Éxodo', 
2, 
'¿Quién fue encontrado en una canasta en el río Nilo?',
'Moisés',
'fácil',
'Éxodo 2:3-6'),

((SELECT id FROM temas WHERE nombre = 'Personajes'), 
'Génesis', 
5, 
'¿Quién vivió 969 años, más que cualquier otra persona?',
'Matusalén',
'difícil',
'Génesis 5:27');
```

### Interpretación de Sueños

```sql
INSERT INTO preguntas (tema_id, libro, capitulo, texto_pregunta, respuesta_correcta, nivel_dificultad, versiculo_especifico) VALUES
((SELECT id FROM temas WHERE nombre = 'Interpretación de Sueños'), 
'Génesis', 
37, 
'¿Qué soñó José sobre sus hermanos?',
'Que las gavillas de sus hermanos se inclinaban ante la suya',
'medio',
'Génesis 37:7'),

((SELECT id FROM temas WHERE nombre = 'Interpretación de Sueños'), 
'Génesis', 
40, 
'¿Qué soñó el copero de Faraón?',
'Una vid con tres ramas que daba uvas',
'medio',
'Génesis 40:9-11');
```

### Geografía

```sql
INSERT INTO preguntas (tema_id, libro, capitulo, texto_pregunta, respuesta_correcta, nivel_dificultad, versiculo_especifico) VALUES
((SELECT id FROM temas WHERE nombre = 'Geografía'), 
'Génesis', 
11, 
'¿En qué lugar intentaron construir una torre que llegara al cielo?',
'Babel',
'fácil',
'Génesis 11:4'),

((SELECT id FROM temas WHERE nombre = 'Geografía'), 
'Génesis', 
13, 
'¿Qué ciudad escogió Lot para vivir?',
'Sodoma',
'medio',
'Génesis 13:12');
```

### Números

```sql
INSERT INTO preguntas (tema_id, libro, capitulo, texto_pregunta, respuesta_correcta, nivel_dificultad, versiculo_especifico) VALUES
((SELECT id FROM temas WHERE nombre = 'Números'), 
'Génesis', 
7, 
'¿Cuántos de cada animal limpio entró al arca?',
'Siete parejas',
'medio',
'Génesis 7:2'),

((SELECT id FROM temas WHERE nombre = 'Números'), 
'Génesis', 
41, 
'¿Cuántos años de abundancia predijo José?',
'Siete años',
'fácil',
'Génesis 41:29');
```

### Familia

```sql
INSERT INTO preguntas (tema_id, libro, capitulo, texto_pregunta, respuesta_correcta, nivel_dificultad, versiculo_especifico) VALUES
((SELECT id FROM temas WHERE nombre = 'Familia'), 
'Génesis', 
25, 
'¿Quiénes fueron los hijos gemelos de Isaac?',
'Esaú y Jacob',
'fácil',
'Génesis 25:24-26'),

((SELECT id FROM temas WHERE nombre = 'Familia'), 
'Génesis', 
29, 
'¿Cuántas esposas tuvo Jacob?',
'Cuatro (Lea, Raquel, Bilha y Zilpa)',
'medio',
'Génesis 29-30');
```

### Gobierno

```sql
INSERT INTO preguntas (tema_id, libro, capitulo, texto_pregunta, respuesta_correcta, nivel_dificultad, versiculo_especifico) VALUES
((SELECT id FROM temas WHERE nombre = 'Gobierno'), 
'Génesis', 
41, 
'¿Qué título le dio Faraón a José?',
'Gobernador sobre toda la tierra de Egipto',
'medio',
'Génesis 41:43'),

((SELECT id FROM temas WHERE nombre = 'Gobierno'), 
'Éxodo', 
1, 
'¿Cómo se llamaba el faraón que no conoció a José?',
'No se menciona su nombre en la Biblia',
'difícil',
'Éxodo 1:8');
```

### Bendiciones

```sql
INSERT INTO preguntas (tema_id, libro, capitulo, texto_pregunta, respuesta_correcta, nivel_dificultad, versiculo_especifico) VALUES
((SELECT id FROM temas WHERE nombre = 'Bendiciones'), 
'Génesis', 
12, 
'¿Qué le prometió Dios a Abraham?',
'Que haría de él una gran nación y bendeciría a todas las familias de la tierra',
'medio',
'Génesis 12:2-3'),

((SELECT id FROM temas WHERE nombre = 'Bendiciones'), 
'Génesis', 
27, 
'¿Quién recibió la bendición de Isaac que era para Esaú?',
'Jacob',
'fácil',
'Génesis 27:27-29');
```

## 🔄 Insertar Múltiples Preguntas a la Vez

Puedes insertar varias preguntas en una sola consulta:

```sql
INSERT INTO preguntas (tema_id, libro, capitulo, texto_pregunta, respuesta_correcta, nivel_dificultad, versiculo_especifico) VALUES
-- Pregunta 1
((SELECT id FROM temas WHERE nombre = 'Historia'), 
'Génesis', 1, '¿Qué creó Dios el primer día?', 'La luz', 'fácil', 'Génesis 1:3'),

-- Pregunta 2
((SELECT id FROM temas WHERE nombre = 'Historia'), 
'Génesis', 2, '¿De qué fue formado Adán?', 'Del polvo de la tierra', 'fácil', 'Génesis 2:7'),

-- Pregunta 3
((SELECT id FROM temas WHERE nombre = 'Personajes'), 
'Génesis', 3, '¿Quién tentó a Eva en el jardín?', 'La serpiente', 'fácil', 'Génesis 3:1');
```

## 📖 Preguntas del Nuevo Testamento

### Mateo

```sql
INSERT INTO preguntas (tema_id, libro, capitulo, texto_pregunta, respuesta_correcta, nivel_dificultad, versiculo_especifico) VALUES
((SELECT id FROM temas WHERE nombre = 'Personajes'), 
'Mateo', 1, '¿Quién fue el padre terrenal de Jesús?', 'José', 'fácil', 'Mateo 1:16'),

((SELECT id FROM temas WHERE nombre = 'Historia'), 
'Mateo', 2, '¿Dónde nació Jesús?', 'Belén de Judea', 'fácil', 'Mateo 2:1'),

((SELECT id FROM temas WHERE nombre = 'Números'), 
'Mateo', 2, '¿Cuántos magos visitaron a Jesús?', 'La Biblia no especifica el número', 'difícil', 'Mateo 2:1');
```

### Juan

```sql
INSERT INTO preguntas (tema_id, libro, capitulo, texto_pregunta, respuesta_correcta, nivel_dificultad, versiculo_especifico) VALUES
((SELECT id FROM temas WHERE nombre = 'Historia'), 
'Juan', 2, '¿Cuál fue el primer milagro de Jesús?', 'Convertir agua en vino en las bodas de Caná', 'fácil', 'Juan 2:1-11'),

((SELECT id FROM temas WHERE nombre = 'Personajes'), 
'Juan', 3, '¿Quién visitó a Jesús de noche?', 'Nicodemo', 'medio', 'Juan 3:1-2'),

((SELECT id FROM temas WHERE nombre = 'Números'), 
'Juan', 6, '¿Cuántos panes y peces usó Jesús para alimentar a la multitud?', 'Cinco panes y dos peces', 'fácil', 'Juan 6:9');
```

## 🎨 Agregar Metadata (Opcional)

Puedes agregar metadata en formato JSON para categorizar mejor:

```sql
INSERT INTO preguntas (tema_id, libro, capitulo, texto_pregunta, respuesta_correcta, nivel_dificultad, versiculo_especifico, metadata) VALUES
((SELECT id FROM temas WHERE nombre = 'Historia'), 
'Génesis', 
1, 
'¿Qué creó Dios el primer día?',
'La luz',
'fácil',
'Génesis 1:3',
'{"categoria": "creacion", "subtema": "dias_creacion", "orden": 1}'::jsonb);
```

## 🔍 Verificar Preguntas Agregadas

Para ver todas las preguntas de un libro:

```sql
SELECT 
  p.texto_pregunta,
  p.respuesta_correcta,
  p.capitulo,
  t.nombre as tema,
  p.nivel_dificultad
FROM preguntas p
JOIN temas t ON t.id = p.tema_id
WHERE p.libro = 'Génesis'
ORDER BY p.capitulo, p.texto_pregunta;
```

Para contar preguntas por tema:

```sql
SELECT 
  t.nombre as tema,
  COUNT(p.id) as total_preguntas
FROM temas t
LEFT JOIN preguntas p ON p.tema_id = t.id
GROUP BY t.nombre
ORDER BY total_preguntas DESC;
```

Para contar preguntas por libro:

```sql
SELECT 
  libro,
  COUNT(*) as total_preguntas
FROM preguntas
GROUP BY libro
ORDER BY total_preguntas DESC;
```

## 📌 Consejos

1. **Un capítulo por pregunta**: Siempre usa un solo número en el campo `capitulo`
2. **Respuestas claras**: Las respuestas deben ser concisas pero completas
3. **Niveles apropiados**: 
   - Fácil: Hechos básicos que todos conocen
   - Medio: Requiere conocimiento más profundo
   - Difícil: Detalles específicos o menos conocidos
4. **Referencias exactas**: Incluye el versículo específico cuando sea posible
5. **Variedad**: Mezcla diferentes tipos de preguntas (qué, quién, cuándo, dónde, por qué)

## 🚀 Cómo Usar

1. Abre el **SQL Editor** en tu dashboard de Supabase
2. Copia el SQL de las preguntas que quieras agregar
3. Pega en el editor
4. Haz clic en "Run" o presiona Ctrl+Enter
5. Verifica que se hayan agregado correctamente

¡Listo! Ahora tendrás más preguntas disponibles en tu quiz 🎉
