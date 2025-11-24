# 🎮 Guía de Prueba del Acelerómetro

## ✅ Cambios Implementados (Mejores Prácticas 2024)

### 1. Thresholds Optimizados
- **Arriba**: `-40°` (antes era -30°, ahora más sensible)
- **Abajo**: `+40°` (antes era +30°)
- **Gamma**: `±45°` (permite más inclinación lateral)
- **Debounce**: `800ms` (evita triggers accidentales)

### 2. Event Listener Mejorado
```typescript
window.addEventListener('deviceorientation', handler, true);
//                                                      ↑
//                                                  capture phase
```
El `true` usa capture phase, más confiable en móviles.

### 3. Logging Detallado
Ahora verás en consola:
```
🎮 Acelerómetro iniciado
   Threshold arriba: -40°
   Threshold abajo: 40°
   Gamma máximo: ±45°
📱 Beta: -35.2°, Gamma: 12.5°  (cada 500ms)
⬆️ ARRIBA detectado - Beta: -42.3°, Gamma: 10.1°
```

### 4. Audio Mejorado
- Limpieza automática de AudioContext
- Manejo de errores robusto
- Duraciones optimizadas (150ms/120ms)

## 🧪 Cómo Probar

### Paso 1: Abrir en el Teléfono

1. Asegúrate que `npm run dev` esté corriendo
2. Encuentra tu IP local:
   ```bash
   ipconfig
   # Busca "IPv4 Address" (ej: 192.168.1.100)
   ```
3. En tu teléfono, abre: `http://TU_IP:5173`
   - Ejemplo: `http://192.168.1.100:5173`

### Paso 2: Verificar Permisos

1. Selecciona temas y filtros
2. Haz clic en "Iniciar Juego"
3. Si aparece modal de permisos → **"Permitir Acceso"**
4. Voltea el teléfono a landscape

### Paso 3: Abrir Consola en Móvil

**Android Chrome**:
1. En PC, abre Chrome
2. Ve a `chrome://inspect`
3. Conecta tu teléfono por USB
4. Habilita "USB Debugging" en el teléfono
5. Haz clic en "Inspect" en tu dispositivo

**iOS Safari**:
1. En Mac, abre Safari
2. Safari → Develop → [Tu iPhone] → localhost
3. Abre la consola

**Alternativa (sin cable)**:
1. Usa Eruda (consola móvil):
   ```javascript
   // Agregar temporalmente en +page.svelte
   import('https://cdn.jsdelivr.net/npm/eruda').then(eruda => eruda.default.init());
   ```

### Paso 4: Probar Movimientos

Con la consola abierta:

**Test 1: Verificar Detección**
1. Mantén el teléfono en landscape
2. Deberías ver logs cada 500ms:
   ```
   📱 Beta: -5.2°, Gamma: 3.1°
   ```

**Test 2: Inclinar Arriba**
1. Inclina la parte **superior** del teléfono hacia arriba
2. Beta debería volverse **más negativo**
3. Cuando llegue a `-40°` o menos:
   ```
   ⬆️ ARRIBA detectado - Beta: -42.3°, Gamma: 10.1°
   ```
4. Deberías escuchar un tono alto
5. Deberías sentir vibración
6. La pregunta debería avanzar

**Test 3: Inclinar Abajo**
1. Inclina la parte **inferior** del teléfono hacia arriba
2. Beta debería volverse **más positivo**
3. Cuando llegue a `+40°` o más:
   ```
   ⬇️ ABAJO detectado - Beta: 45.1°, Gamma: 8.3°
   ```
4. Deberías escuchar un tono bajo
5. La pregunta debería pasar

## 🐛 Troubleshooting

### "No veo logs de Beta/Gamma"

**Causa**: El acelerómetro no está iniciado o no hay permisos

**Solución**:
1. Verifica que veas: `🎮 Acelerómetro iniciado`
2. Si no, verifica permisos
3. Recarga la app

### "Beta/Gamma siempre en 0"

**Causa**: Permisos denegados o navegador no soportado

**Solución**:
1. Verifica permisos en configuración del navegador
2. Prueba en Chrome (mejor soporte)
3. Asegúrate que estás en HTTPS o localhost

### "No detecta hacia arriba"

**Causa**: No estás inclinando lo suficiente

**Solución**:
1. Observa el valor de Beta en consola
2. Necesitas llegar a `-40°` o menos
3. Inclina MÁS la parte superior hacia arriba
4. Verifica que Gamma esté entre -45° y +45°

### "No detecta hacia abajo"

**Causa**: Similar al anterior

**Solución**:
1. Observa Beta en consola
2. Necesitas llegar a `+40°` o más
3. Inclina MÁS la parte inferior hacia arriba

### "No escucho sonidos"

**Causa**: Volumen bajo o audio bloqueado

**Solución**:
1. Sube el volumen del teléfono
2. Verifica que no esté en silencio
3. Toca la pantalla una vez (algunos navegadores requieren interacción)
4. Verifica consola por errores de audio

### "Detecta demasiado rápido"

**Causa**: Debounce muy bajo

**Solución**:
1. Aumenta `debounceMs` en el código
2. Actualmente está en 800ms (0.8 segundos)

### "Detecta muy lento"

**Causa**: Debounce muy alto

**Solución**:
1. Reduce `debounceMs` en el código
2. Mínimo recomendado: 500ms

## 📊 Valores de Referencia

### Orientación del Teléfono

```
Landscape (horizontal):
┌─────────────────┐
│                 │  ← Parte superior
│                 │
│                 │
│                 │  ← Parte inferior
└─────────────────┘

Inclinar arriba:
        ↗
┌─────────────────┐
│                 │
│                 │
└─────────────────┘
Beta: -40° o menos (negativo)

Inclinar abajo:
┌─────────────────┐
│                 │
│                 │
└─────────────────┘
        ↘
Beta: +40° o más (positivo)
```

### Rangos de Beta

- **-90° a -40°**: Detecta ARRIBA ✅
- **-40° a +40°**: Zona neutral (no detecta)
- **+40° a +90°**: Detecta ABAJO ✅

### Rangos de Gamma

- **-45° a +45°**: Permitido ✅
- **Fuera de rango**: No detecta (muy inclinado de lado)

## 🎯 Checklist de Prueba

- [ ] App corriendo en `http://IP:5173`
- [ ] Abrí en el teléfono
- [ ] Permisos concedidos
- [ ] Consola abierta (Chrome inspect o Eruda)
- [ ] Veo logs de `📱 Beta/Gamma`
- [ ] Veo `🎮 Acelerómetro iniciado`
- [ ] Teléfono en landscape
- [ ] Inclino arriba → Beta < -40° → Detecta ⬆️
- [ ] Inclino abajo → Beta > +40° → Detecta ⬇️
- [ ] Escucho sonidos
- [ ] Siento vibración

## 💡 Tips

1. **Inclina más de lo que crees**: Los 40° son bastante
2. **Mantén el teléfono recto lateralmente**: Gamma debe estar cerca de 0°
3. **Espera entre movimientos**: El debounce es de 800ms
4. **Observa los logs**: Te dirán exactamente qué está pasando

---

Si después de seguir esta guía aún no funciona, comparte:
1. Los logs de consola
2. Los valores de Beta/Gamma que ves
3. El navegador y versión que usas
