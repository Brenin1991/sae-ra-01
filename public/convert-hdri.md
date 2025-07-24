# 🌅 Guia para Usar HDRI no SAE RA

## Problema
O arquivo `sky.hdr` não pode ser carregado diretamente pelo A-Frame, pois navegadores não suportam nativamente arquivos .hdr.

## Soluções

### Opção 1: Converter para JPG/PNG 360°
1. **Online:** Use [HDRI to CubeMap](https://www.hdri-to-cubemap.com/)
2. **Software:** GIMP, Photoshop, ou Blender
3. **Salve como:** `sky.jpg` ou `sky.png`
4. **Substitua no código:** `src="assets/sky.jpg"`

### Opção 2: Usar formato EXR
1. Converta .hdr para .exr
2. Use biblioteca Three.js EXRLoader
3. Requer JavaScript adicional

### Opção 3: CubeMap (6 faces)
1. Converta HDRI para 6 imagens (frente, trás, cima, baixo, esquerda, direita)
2. Use `<a-sky>` com material cubemap

## Implementação Rápida

Substitua no `index.html`:
```html
<!-- Ao invés de sky.hdr, use: -->
<img id="skyTexture" src="assets/sky.jpg" crossorigin="anonymous">

<a-sky src="#skyTexture"></a-sky>
```

## Testando
1. Coloque o arquivo convertido em `public/assets/`
2. Acesse o botão "🌅 Modo HDRI"
3. Deve funcionar perfeitamente!

---

**Status Atual:** Usando gradient de fallback - funciona mas não é o HDRI real. 