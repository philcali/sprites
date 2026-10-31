import { useState, useRef, useCallback, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Card from 'react-bootstrap/Card';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';

const TOOLS = [
  { id: 'select', label: 'Select', icon: '⊹' },
  { id: 'crop', label: 'Crop', icon: '⬒' },
  { id: 'eraser', label: 'Eraser', icon: '◻' },
  { id: 'brush', label: 'Brush', icon: '●' },
  { id: 'colorkey', label: 'Color Key', icon: '◆' },
];

const COLOR_PRESETS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#800000', '#008000',
  '#000080', '#808000', '#800080', '#008080', '#808080',
];

function Editor() {
  const canvasRef = useRef(null);
  const originalImageRef = useRef(null);
  const [image, setImage] = useState(null);
  const [tool, setTool] = useState('select');
  const [zoom, setZoom] = useState(2);
  const [brushSize, setBrushSize] = useState(4);
  const [color, setColor] = useState('#FFFFFF');
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState(null);

  // Crop state
  const [cropStart, setCropStart] = useState(null);
  const [cropEnd, setCropEnd] = useState(null);
  const [isCropping, setIsCropping] = useState(false);

  // Resize state
  const [resizeTarget, setResizeTarget] = useState({ w: 32, h: 32 });
  const [preserveAspect, setPreserveAspect] = useState(true);

  // Color adjustment state
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [hue, setHue] = useState(0);

  // BG removal state
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [bgTolerance, setBgTolerance] = useState(32);

  // Color key state
  const [pickedColor, setPickedColor] = useState(null);
  const [colorKeyTolerance, setColorKeyTolerance] = useState(16);

  // Load image
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        originalImageRef.current = img;
        setResizeTarget({ w: img.width, h: img.height });
        resetAdjustments();
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const resetAdjustments = () => {
    setBrightness(0); setContrast(0); setSaturation(0); setHue(0);
  };

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom,
    };
  };

  // Draw image with current filters
  const drawWithFilters = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.imageSmoothingEnabled = false;

    // Apply CSS-like filters
    const filters = [];
    if (brightness !== 0) filters.push(`brightness(${1 + brightness / 100})`);
    if (contrast !== 0) filters.push(`contrast(${1 + contrast / 100})`);
    if (saturation !== 0) filters.push(`saturate(${1 + saturation / 100})`);
    if (hue !== 0) filters.push(`hue-rotate(${hue}deg)`);
    if (filters.length > 0) {
      ctx.filter = filters.join(' ');
    } else {
      ctx.filter = 'none';
    }
    ctx.drawImage(image, 0, 0);
    ctx.filter = 'none';
  }, [image, brightness, contrast, saturation, hue]);

  useEffect(() => {
    drawWithFilters();
  }, [drawWithFilters]);

  // Resize
  const handleResize = () => {
    if (!image) return;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = resizeTarget.w;
    tempCanvas.height = resizeTarget.h;
    const ctx = tempCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, 0, 0, resizeTarget.w, resizeTarget.h);
    const newImg = new Image();
    newImg.onload = () => {
      setImage(newImg);
      originalImageRef.current = newImg;
    };
    newImg.src = tempCanvas.toDataURL();
  };

  // Flip / Rotate
  const handleTransform = (transform) => {
    if (!image) return;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = image.width;
    tempCanvas.height = image.height;
    const ctx = tempCanvas.getContext('2d');

    if (transform === 'flipH') {
      ctx.translate(image.width, 0);
      ctx.scale(-1, 1);
    } else if (transform === 'flipV') {
      ctx.translate(0, image.height);
      ctx.scale(1, -1);
    } else if (transform === 'rotate90') {
      tempCanvas.width = image.height;
      tempCanvas.height = image.width;
      ctx.translate(image.height, 0);
      ctx.rotate(Math.PI / 2);
    } else if (transform === 'rotate270') {
      tempCanvas.width = image.height;
      tempCanvas.height = image.width;
      ctx.translate(0, image.width);
      ctx.rotate(-Math.PI / 2);
    }

    ctx.drawImage(image, 0, 0);
    const newImg = new Image();
    newImg.onload = () => {
      setImage(newImg);
      originalImageRef.current = newImg;
      setResizeTarget({ w: newImg.width, h: newImg.height });
    };
    newImg.src = tempCanvas.toDataURL();
  };

  // Crop
  const applyCrop = () => {
    if (!cropStart || !cropEnd || !image) return;
    const x = Math.min(cropStart.x, cropEnd.x);
    const y = Math.min(cropStart.y, cropEnd.y);
    const w = Math.abs(cropEnd.x - cropStart.x);
    const h = Math.abs(cropEnd.y - cropStart.y);
    if (w < 1 || h < 1) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = w;
    tempCanvas.height = h;
    const ctx = tempCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, x, y, w, h, 0, 0, w, h);

    const newImg = new Image();
    newImg.onload = () => {
      setImage(newImg);
      originalImageRef.current = newImg;
      setResizeTarget({ w, h });
    };
    newImg.src = tempCanvas.toDataURL();
    setCropStart(null);
    setCropEnd(null);
    setIsCropping(false);
  };

  // Eraser / Brush
  const startDraw = (e) => {
    if (tool !== 'eraser' && tool !== 'brush') return;
    const pos = getCanvasCoords(e);
    setIsDrawing(true);
    setLastPos(pos);

    if (tool === 'eraser') {
      const ctx = canvasRef.current.getContext('2d');
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  };

  const moveDraw = (e) => {
    if (!isDrawing || tool !== 'eraser' && tool !== 'brush') return;
    const pos = getCanvasCoords(e);
    const ctx = canvasRef.current.getContext('2d');

    if (tool === 'brush') {
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (tool === 'eraser') {
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.restore();
    }
    setLastPos(pos);
  };

  const endDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    // Convert back to a clean image (removes transparency artifacts)
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL();
    const newImg = new Image();
    newImg.onload = () => {
      setImage(newImg);
      originalImageRef.current = newImg;
    };
    newImg.src = dataUrl;
  };

  // BG removal
  const removeBackground = () => {
    if (!image) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Parse BG color
    const r = parseInt(bgColor.slice(1, 3), 16);
    const g = parseInt(bgColor.slice(3, 5), 16);
    const b = parseInt(bgColor.slice(5, 7), 16);

    for (let i = 0; i < data.length; i += 4) {
      const dr = Math.abs(data[i] - r);
      const dg = Math.abs(data[i + 1] - g);
      const db = Math.abs(data[i + 2] - b);
      if (dr + dg + db < bgTolerance * 3) {
        data[i + 3] = 0;
      }
    }
    ctx.putImageData(imageData, 0, 0);

    const newImg = new Image();
    newImg.onload = () => {
      setImage(newImg);
      originalImageRef.current = newImg;
    };
    newImg.src = canvas.toDataURL();
  };

  // Download
  const handleDownload = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'sprite.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Crop mouse handlers
  const handleCropStart = (e) => {
    if (tool !== 'crop') return;
    const pos = getCanvasCoords(e);
    setCropStart(pos);
    setCropEnd(pos);
    setIsCropping(true);
  };

  const handleCropMove = (e) => {
    if (!isCropping) return;
    const pos = getCanvasCoords(e);
    setCropEnd(pos);
  };

  // Color key: pick color from canvas
  const pickColorKey = (e) => {
    if (tool !== 'colorkey') return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / zoom);
    const y = Math.floor((e.clientY - rect.top) / zoom);
    const ctx = canvas.getContext('2d');
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = '#' + [pixel[0], pixel[1], pixel[2]]
      .map(v => v.toString(16).padStart(2, '0')).join('');
    setPickedColor(hex);
  };

  // Get canvas display size
  const canvasDisplayWidth = image ? Math.min(image.width * zoom, window.innerWidth - 40) : 600;
  const canvasDisplayHeight = image ? Math.min(image.height * zoom, window.innerHeight - 300) : 400;

  return (
    <Container fluid>
      <Row>
        {/* Left: Tools panel */}
        <Col md={3} lg={2}>
          <Card className="mb-3">
            <Card.Header className="fw-bold">Tools</Card.Header>
            <Card.Body className="p-2">
              <div className="d-flex gap-1 mb-3">
                {TOOLS.map(t => (
                  <Button
                    key={t.id}
                    variant={tool === t.id ? 'primary' : 'outline-secondary'}
                    size="sm"
                    onClick={() => setTool(t.id)}
                    title={t.label}
                    style={{ minWidth: 36 }}
                  >
                    {t.icon}
                  </Button>
                ))}
              </div>

              {tool === 'eraser' || tool === 'brush' ? (
                <Form className="mb-3">
                  <Form.Label className="small">Brush Size: {brushSize}px</Form.Label>
                  <Form.Range min={1} max={32} value={brushSize} onChange={e => setBrushSize(+e.target.value)} />
                  <Form.Label className="small mt-2">Color</Form.Label>
                  <input type="color" className="form-control form-control-color w-100" value={color} onChange={e => setColor(e.target.value)} />
                  <div className="d-flex flex-wrap gap-1 mt-2">
                    {COLOR_PRESETS.map(c => (
                      <div
                        key={c}
                        className="rounded-circle"
                        style={{ width: 20, height: 20, background: c, border: '1px solid #ccc', cursor: 'pointer' }}
                        onClick={() => setColor(c)}
                      />
                    ))}
                  </div>
                </Form>
              ) : null}

              {tool === 'crop' && (
                <div className="mb-3">
                  <Form.Label className="small">Click & drag on canvas to crop</Form.Label>
                  {cropStart && cropEnd && (
                    <Button variant="success" size="sm" className="w-100 mt-1" onClick={applyCrop}>
                      Apply Crop
                    </Button>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Header className="fw-bold">Resize</Card.Header>
            <Card.Body className="p-2">
              <InputGroup size="sm" className="mb-2">
                <InputGroup.Text>W</InputGroup.Text>
                <Form.Control type="number" value={resizeTarget.w} onChange={e => setResizeTarget(p => ({ ...p, w: +e.target.value }))} />
                <InputGroup.Text>H</InputGroup.Text>
                <Form.Control type="number" value={resizeTarget.h} onChange={e => setResizeTarget(p => ({ ...p, h: +e.target.value }))} />
              </InputGroup>
              <Form.Check
                type="checkbox"
                label="Lock ratio"
                checked={preserveAspect}
                onChange={e => setPreserveAspect(e.target.checked)}
                className="mb-2"
              />
              <Button variant="primary" size="sm" className="w-100" onClick={handleResize}>
                Resize
              </Button>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Header className="fw-bold">Flip / Rotate</Card.Header>
            <Card.Body className="p-2 d-flex gap-1 flex-wrap">
              <Button variant="outline-secondary" size="sm" onClick={() => handleTransform('flipH')}>↔ Flip H</Button>
              <Button variant="outline-secondary" size="sm" onClick={() => handleTransform('flipV')}>↕ Flip V</Button>
              <Button variant="outline-secondary" size="sm" onClick={() => handleTransform('rotate90')}>↻ 90°</Button>
              <Button variant="outline-secondary" size="sm" onClick={() => handleTransform('rotate270')}>↺ 270°</Button>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Header className="fw-bold">Color</Card.Header>
            <Card.Body className="p-2">
              {[
                { label: 'Brightness', value: brightness, set: setBrightness, min: -100, max: 100 },
                { label: 'Contrast', value: contrast, set: setContrast, min: -100, max: 100 },
                { label: 'Saturation', value: saturation, set: setSaturation, min: -100, max: 100 },
                { label: 'Hue Rotate', value: hue, set: setHue, min: 0, max: 360 },
              ].map(s => (
                <div key={s.label} className="mb-2">
                  <Form.Label className="small d-flex justify-content-between">
                    {s.label} <span>{s.value > 0 ? '+' : ''}{s.value}</span>
                  </Form.Label>
                  <Form.Range min={s.min} max={s.max} value={s.value} onChange={e => s.set(+e.target.value)} />
                </div>
              ))}
              <Button variant="outline-secondary" size="sm" className="w-100" onClick={resetAdjustments}>
                Reset
              </Button>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Header className="fw-bold">BG Removal</Card.Header>
            <Card.Body className="p-2">
              <Form.Label className="small">Target Color</Form.Label>
              <input type="color" className="form-control form-control-color w-100 mb-2" value={bgColor} onChange={e => setBgColor(e.target.value)} />
              <Form.Label className="small">Tolerance: {bgTolerance}</Form.Label>
              <Form.Range min={1} max={128} value={bgTolerance} onChange={e => setBgTolerance(+e.target.value)} className="mb-2" />
              <Button variant="danger" size="sm" className="w-100" onClick={removeBackground}>
                Remove Background
              </Button>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Header className="fw-bold">Color Key</Card.Header>
            <Card.Body className="p-2">
              <p className="small text-muted mb-2">Click the canvas to pick a color, then apply.</p>
              {pickedColor ? (
                <>
                  <Form.Label className="small">Picked: <span style={{ display: 'inline-block', width: 16, height: 16, background: pickedColor, border: '1px solid #ccc', verticalAlign: 'middle', borderRadius: 2 }}></span> {pickedColor}</Form.Label>
                  <Form.Label className="small mt-1">Tolerance: {colorKeyTolerance}</Form.Label>
                  <Form.Range min={1} max={64} value={colorKeyTolerance} onChange={e => setColorKeyTolerance(+e.target.value)} className="mb-2" />
                  <Button variant="warning" size="sm" className="w-100" onClick={() => {
                    if (!image) return;
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = image.width;
                    tempCanvas.height = image.height;
                    const ctx = tempCanvas.getContext('2d');
                    ctx.drawImage(image, 0, 0);
                    const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
                    const data = imageData.data;
                    const tr = parseInt(pickedColor.slice(1, 3), 16);
                    const tg = parseInt(pickedColor.slice(3, 5), 16);
                    const tb = parseInt(pickedColor.slice(5, 7), 16);
                    const tol = colorKeyTolerance * 3;
                    for (let i = 0; i < data.length; i += 4) {
                      const dr = Math.abs(data[i] - tr);
                      const dg = Math.abs(data[i + 1] - tg);
                      const db = Math.abs(data[i + 2] - tb);
                      if (dr + dg + db < tol) {
                        data[i + 3] = 0;
                      }
                    }
                    ctx.putImageData(imageData, 0, 0);
                    const newImg = new Image();
                    newImg.onload = () => {
                      setImage(newImg);
                      originalImageRef.current = newImg;
                    };
                    newImg.src = tempCanvas.toDataURL();
                  }}>
                    Make Transparent
                  </Button>
                  <Button variant="outline-secondary" size="sm" className="w-100 mt-1" onClick={() => setPickedColor(null)}>
                    Clear
                  </Button>
                </>
              ) : (
                <p className="small text-muted">Select the <strong>Color Key</strong> tool and click on the canvas.</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Center: Canvas */}
        <Col md={6} lg={7} className="d-flex flex-column align-items-center">
          <Card className="mb-3 flex-grow-1" style={{ maxWidth: '100%', overflow: 'auto' }}>
            <Card.Body className="p-0 d-flex align-items-center justify-content-center"
              style={{ background: '#2b2b2b', minHeight: 400 }}>
              {image ? (
                <canvas
                  ref={canvasRef}
                  style={{
                    width: canvasDisplayWidth,
                    height: canvasDisplayHeight,
                    imageRendering: 'pixelated',
                    cursor: tool === 'crop' ? 'crosshair' : tool === 'eraser' || tool === 'brush' ? 'crosshair' : 'default',
                  }}
                  onMouseDown={tool === 'crop' ? handleCropStart : tool === 'colorkey' ? pickColorKey : startDraw}
                  onMouseMove={(e) => { moveDraw(e); handleCropMove(e); }}
                  onMouseUp={tool === 'crop' ? handleCropMove : endDraw}
                  onMouseLeave={endDraw}
                />
              ) : (
                <div className="text-center text-muted">
                  <svg width="64" height="64" viewBox="0 0 16 16" fill="currentColor" className="mb-3 opacity-25">
                    <path d="M6.5 1A1.5 1.5 0 005 2.5V3H1.5a1.5 1.5 0 00-1.5 1.5v8.5A1.5 1.5 0 001.5 14h13a1.5 1.5 0 001.5-1.5V4.5A1.5 1.5 0 0014.5 3H11v-.5A1.5 1.5 0 009.5 1h-3zM4.5 3A.5.5 0 015 2.5h3A.5.5 0 018.5 3v2H7.5V5h-1V3H5.5v2H4.5V3zm-3 3.5a.5.5 0 01.5-.5h13a.5.5 0 01.5.5v.5a.5.5 0 01-.5.5H2a.5.5 0 01-.5-.5v-.5z"/>
                  </svg>
                  <p className="mb-1">Upload a sprite to get started</p>
                  <p className="small opacity-50">PNG, JPG, GIF, WebP</p>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Upload + Download bar */}
          <Row className="w-100">
            <Col xs="auto">
              <label className="btn btn-outline-primary mb-0">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="me-1">
                  <path d="M.5 9.9a.5.5 0 01.5.5v2.5a1 1 0 001 1h12a1 1 0 001-1v-2.5a.5.5 0 011 0v2.5a2 2 0 01-2 2H2a2 2 0 01-2-2v-2.5a.5.5 0 01.5-.5z"/>
                  <path d="M7.646 1.146a.5.5 0 01.708 0l3 3a.5.5 0 01-.708.708L8.5 2.707V6.5a.5.5 0 01-1 0V2.707L5.354 4.854a.5.5 0 11-.708-.708l3-3z"/>
                </svg>
                Upload
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
              </label>
            </Col>
            <Col xs="auto">
              <Button variant="outline-success" disabled={!image} onClick={handleDownload}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="me-1">
                  <path d="M.5 9.9a.5.5 0 01.5.5v2.5a1 1 0 001 1h12a1 1 0 001-1v-2.5a.5.5 0 011 0v2.5a2 2 0 01-2 2H2a2 2 0 01-2-2v-2.5a.5.5 0 01.5-.5z"/>
                  <path d="M7.646 11.854a.5.5 0 00.708 0l3-3a.5.5 0 00-.708-.708L8.5 10.293V1.5a.5.5 0 00-1 0v8.793L5.354 8.146a.5.5 0 10-.708.708l3 3z"/>
                </svg>
                Download PNG
              </Button>
            </Col>
            <Col xs="auto">
              <ButtonGroup>
                <Button variant="outline-secondary" size="sm" onClick={() => setZoom(z => Math.max(1, z - 1))}>−</Button>
                <Button variant="outline-secondary" size="sm" className="px-2" style={{ minWidth: 48 }}>{zoom}x</Button>
                <Button variant="outline-secondary" size="sm" onClick={() => setZoom(z => Math.min(16, z + 1))}>+</Button>
              </ButtonGroup>
            </Col>
          </Row>
        </Col>

        {/* Right: Layers / Frames panel */}
        <Col md={3} lg={3}>
          <Card className="mb-3">
            <Card.Header className="fw-bold">Sprite Sheet Builder</Card.Header>
            <Card.Body className="p-2">
              <p className="small text-muted mb-2">Load multiple sprites to stitch them together.</p>
              <label className="btn btn-outline-primary btn-sm w-100 mb-2">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="me-1">
                  <path d="M.5 9.9a.5.5 0 01.5.5v2.5a1 1 0 001 1h12a1 1 0 001-1v-2.5a.5.5 0 011 0v2.5a2 2 0 01-2 2H2a2 2 0 01-2-2v-2.5a.5.5 0 01.5-.5z"/>
                  <path d="M7.646 1.146a.5.5 0 01.708 0l3 3a.5.5 0 01-.708.708L8.5 2.707V6.5a.5.5 0 01-1 0V2.707L5.354 4.854a.5.5 0 11-.708-.708l3-3z"/>
                </svg>
                Add Sprite
                <input type="file" accept="image/*" multiple style={{ display: 'none' }} />
              </label>
              <Form.Select size="sm" className="mb-2">
                <option>Layout: Horizontal</option>
                <option>Layout: Vertical</option>
                <option>Layout: Grid</option>
              </Form.Select>
              <Button variant="success" size="sm" className="w-100" disabled={!image}>
                Stitch & Download
              </Button>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header className="fw-bold">History</Card.Header>
            <Card.Body className="p-2 text-center text-muted small">
              {image ? (
                <div>
                  <svg width="32" height="32" viewBox="0 0 16 16" fill="currentColor" className="mb-2 opacity-25">
                    <path d="M8.515 1.019A7 7 0 008 1V0a8 8 0 01.589.022l-.074.99a6 6 0 00-.906.122A8 8 0 018.515 1.02z"/>
                    <path d="M8 4a.5.5 0 01.5.5v3h-3a.5.5 0 010-1h2V4.5A.5.5 0 018 4zm3 9a.5.5 0 01-.5.5H3.5a.5.5 0 01-.5-.5v-.5a.5.5 0 01.5-.5H11v.5z"/>
                  </svg>
                  <p>Apply edits to see history</p>
                </div>
              ) : (
                <p>No image loaded</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Editor;
