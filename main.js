document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // DOM elements
    const imageInput = document.getElementById('imageInput');
    const loadImageBtn = document.getElementById('loadImageBtn');
    const detectAreasBtn = document.getElementById('detectAreasBtn');
    const exportBtn = document.getElementById('exportBtn');
    const createGifBtn = document.getElementById('createGifBtn');
    const autoCaptureBtn = document.getElementById('autoCaptureBtn');
    const resetBtn = document.getElementById('resetBtn');
    const templateCanvas = document.getElementById('templateCanvas');
    const templateCtx = templateCanvas.getContext('2d', {
        willReadFrequently: true
    });
    const photoCanvas = document.getElementById('photoCanvas');
    const photoCtx = photoCanvas.getContext('2d', {
        willReadFrequently: true
    });
    const statusText = document.getElementById('statusText');
    const resultsCount = document.getElementById('resultsCount');
    const detectionResults = document.getElementById('detectionResults');
    const chromaColor = document.getElementById('chromaColor');
    const toleranceSlider = document.getElementById('tolerance');
    const toleranceValue = document.getElementById('toleranceValue');
    const minAreaSlider = document.getElementById('minArea');
    const minAreaValue = document.getElementById('minAreaValue');
    const featheringSlider = document.getElementById('feathering');
    const featheringValue = document.getElementById('featheringValue');
    const idleTimeSlider = document.getElementById('idleTime');
    const idleTimeValue = document.getElementById('idleTimeValue');
    const countdownTimeSlider = document.getElementById('countdownTime');
    const countdownTimeValue = document.getElementById('countdownTimeValue');
    const startCameraBtn = document.getElementById('startCameraBtn');
    const captureBtn = document.getElementById('captureBtn');
    const webcamVideo = document.getElementById('webcamVideo');
    const captureOverlay = document.getElementById('captureOverlay');
    const captureOverlayCtx = captureOverlay.getContext('2d');
    const countdownOverlay = document.getElementById('countdownOverlay');
    const countdownNumber = document.getElementById('countdownNumber');
    const countdownMessage = document.getElementById('countdownMessage');
    const webcamPreview = document.getElementById('webcamPreview');
    const detachPreviewBtn = document.getElementById('detachPreviewBtn');
    const cameraOptionsBtn = document.getElementById('cameraOptionsBtn');
    const cropModal = new bootstrap.Modal(document.getElementById('cropModal'));
    const cropImage = document.getElementById('cropImage');
    const cropAreaId = document.getElementById('cropAreaId');
    const applyCrop = document.getElementById('applyCrop');
    const exportModal = new bootstrap.Modal(document.getElementById('exportModal'));
    const exportFileName = document.getElementById('exportFileName');
    const exportDPI = document.getElementById('exportDPI');
    const confirmExport = document.getElementById('confirmExport');
    const gifExportModal = new bootstrap.Modal(document.getElementById('gifExportModal'));
    const gifFileName = document.getElementById('gifFileName');
    const gifFrameDuration = document.getElementById('gifFrameDuration');
    const gifQuality = document.getElementById('gifQuality');
    const gifWidth = document.getElementById('gifWidth');
    const gifHeight = document.getElementById('gifHeight');
    const confirmGifExport = document.getElementById('confirmGifExport');
    const cameraOptionsModal = new bootstrap.Modal(document.getElementById('cameraOptionsModal'));
    const cameraSelect = document.getElementById('cameraSelect');
    const resolutionSelect = document.getElementById('resolutionSelect');
    const mirrorPreview = document.getElementById('mirrorPreview');
    const applyCameraOptions = document.getElementById('applyCameraOptions');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    const qualityOptions = document.querySelectorAll('.quality-option');

    // State variables
    let originalTemplate = null;
    let detectedAreas = [];
    let nextAreaId = 1;
    let currentStream = null;
    let dragTarget = null;
    let isDragging = false;
    let dragOffset = {
        x: 0,
        y: 0
    };
    let currentCaptureArea = null;
    let dimensionBox = null;
    let currentCropper = null;
    let currentCropArea = null;
    let exportQuality = 1.0;
    let autoCaptureInterval = null;
    let autoCaptureTimeout = null;
    let isAutoCaptureActive = false;
    let currentCameraId = null;
    let isPreviewDetached = false;
    let detachedPreview = null;

    // Event listeners
    loadImageBtn.addEventListener('click', () => imageInput.click());
    imageInput.addEventListener('change', handleTemplateUpload);
    detectAreasBtn.addEventListener('click', detectChromaAreas);
    exportBtn.addEventListener('click', () => exportModal.show());
    createGifBtn.addEventListener('click', () => gifExportModal.show());
    autoCaptureBtn.addEventListener('click', toggleAutoCapture);
    resetBtn.addEventListener('click', resetApp);
    toleranceSlider.addEventListener('input', updateTolerance);
    minAreaSlider.addEventListener('input', updateMinArea);
    featheringSlider.addEventListener('input', updateFeathering);
    idleTimeSlider.addEventListener('input', updateIdleTime);
    countdownTimeSlider.addEventListener('input', updateCountdownTime);
    startCameraBtn.addEventListener('click', startCamera);
    captureBtn.addEventListener('click', captureFromWebcam);
    applyCrop.addEventListener('click', applyCropToArea);
    confirmExport.addEventListener('click', exportImage);
    confirmGifExport.addEventListener('click', createGIF);
    cameraOptionsBtn.addEventListener('click', showCameraOptions);
    applyCameraOptions.addEventListener('click', applyCameraOptionsHandler);
    detachPreviewBtn.addEventListener('click', toggleDetachPreview);

    // Quality option event listeners
    qualityOptions.forEach(option => {
        option.addEventListener('click', function() {
            qualityOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            exportQuality = parseFloat(this.getAttribute('data-quality'));
        });
    });

    // Canvas event listeners for dragging
    photoCanvas.addEventListener('mousedown', startDrag);
    photoCanvas.addEventListener('mousemove', drag);
    photoCanvas.addEventListener('mouseup', endDrag);
    photoCanvas.addEventListener('mouseleave', endDrag);

    // Functions
    function handleTemplateUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                originalTemplate = img;

                // Set canvas dimensions to match image exactly
                templateCanvas.width = img.width;
                templateCanvas.height = img.height;
                photoCanvas.width = img.width;
                photoCanvas.height = img.height;

                // Maintain aspect ratio in display
                adjustCanvasDisplaySize();

                templateCtx.drawImage(img, 0, 0);
                statusText.textContent = 'Template loaded. Ready for detection.';
                detectedAreas = [];
                updateResultsUI();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function adjustCanvasDisplaySize() {
        // This function maintains the aspect ratio of the canvas in the container
        const container = document.querySelector('.canvas-container');
        const aspectRatio = templateCanvas.width / templateCanvas.height;

        // Calculate maximum dimensions that fit the container
        let displayWidth = container.clientWidth;
        let displayHeight = container.clientHeight;

        if (displayWidth / displayHeight > aspectRatio) {
            displayWidth = displayHeight * aspectRatio;
        } else {
            displayHeight = displayWidth / aspectRatio;
        }

        // Set canvas display size (doesn't affect actual canvas resolution)
        templateCanvas.style.width = `${displayWidth}px`;
        templateCanvas.style.height = `${displayHeight}px`;
        photoCanvas.style.width = `${displayWidth}px`;
        photoCanvas.style.height = `${displayHeight}px`;
    }

    function updateTolerance() {
        toleranceValue.textContent = toleranceSlider.value;
    }

    function updateMinArea() {
        minAreaValue.textContent = minAreaSlider.value;
    }

    function updateFeathering() {
        featheringValue.textContent = featheringSlider.value;
    }

    function updateIdleTime() {
        idleTimeValue.textContent = idleTimeSlider.value;
    }

    function updateCountdownTime() {
        countdownTimeValue.textContent = countdownTimeSlider.value;
    }

    function detectChromaAreas() {
        if (!originalTemplate) {
            statusText.textContent = 'Please load a template first.';
            return;
        }

        statusText.textContent = 'Detecting chroma key areas...';

        // Reset state
        detectedAreas = [];
        nextAreaId = 1;

        // Draw the original template
        templateCtx.drawImage(originalTemplate, 0, 0);

        // Get template image data
        const imageData = templateCtx.getImageData(0, 0, templateCanvas.width, templateCanvas.height);
        const data = imageData.data;

        // Parse the selected chroma key color
        const chromaHex = chromaColor.value;
        const chromaR = parseInt(chromaHex.substr(1, 2), 16);
        const chromaG = parseInt(chromaHex.substr(3, 2), 16);
        const chromaB = parseInt(chromaHex.substr(5, 2), 16);

        // Create a binary mask for chroma key pixels
        const chromaMask = new Uint8Array(templateCanvas.width * templateCanvas.height);
        const tolerance = parseInt(toleranceSlider.value);
        const feathering = parseInt(featheringSlider.value);

        // First pass: detect chroma key pixels with tolerance
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Calculate color distance with weighted channels (green is more important)
            const distance = Math.sqrt(
                Math.pow(r - chromaR, 2) * 0.3 +
                Math.pow(g - chromaG, 2) * 0.6 +
                Math.pow(b - chromaB, 2) * 0.1
            );

            // Check if pixel is within tolerance
            if (distance <= tolerance) {
                const pixelIndex = i / 4;
                chromaMask[pixelIndex] = 1;
            }
        }

        // Second pass: expand the mask to include adjacent similar pixels
        if (feathering > 0) {
            const expandedMask = new Uint8Array(templateCanvas.width * templateCanvas.height);

            for (let y = 0; y < templateCanvas.height; y++) {
                for (let x = 0; x < templateCanvas.width; x++) {
                    const index = y * templateCanvas.width + x;

                    if (chromaMask[index]) {
                        // Mark this pixel and its neighbors
                        for (let dy = -feathering; dy <= feathering; dy++) {
                            for (let dx = -feathering; dx <= feathering; dx++) {
                                const nx = x + dx;
                                const ny = y + dy;

                                if (nx >= 0 && nx < templateCanvas.width && ny >= 0 && ny < templateCanvas.height) {
                                    const nIndex = ny * templateCanvas.width + nx;
                                    expandedMask[nIndex] = 1;
                                }
                            }
                        }
                    }
                }
            }

            // Replace the original mask with the expanded one
            for (let i = 0; i < chromaMask.length; i++) {
                chromaMask[i] = expandedMask[i];
            }
        }

        // Find connected components (chroma key areas)
        const visited = new Uint8Array(templateCanvas.width * templateCanvas.height);
        const minArea = parseInt(minAreaSlider.value);

        for (let y = 0; y < templateCanvas.height; y++) {
            for (let x = 0; x < templateCanvas.width; x++) {
                const index = y * templateCanvas.width + x;

                if (chromaMask[index] && !visited[index]) {
                    const area = floodFill(chromaMask, visited, x, y, templateCanvas.width, templateCanvas.height);

                    if (area.pixels.length >= minArea) {
                        // Calculate bounding box
                        const bounds = calculateBounds(area.pixels, templateCanvas.width);

                        detectedAreas.push({
                            id: nextAreaId++,
                            bounds: bounds,
                            pixels: area.pixels,
                            photo: null,
                            photoX: bounds.x,
                            photoY: bounds.y,
                            photoScale: 1.0
                        });
                    }
                }
            }
        }

        // Make chroma key areas transparent in the template
        makeChromaAreasTransparent(chromaMask, imageData);
        templateCtx.putImageData(imageData, 0, 0);

        // Draw results
        updateResultsUI();

        statusText.textContent = `Detected ${detectedAreas.length} chroma key areas.`;
    }

    function floodFill(mask, visited, startX, startY, width, height) {
        const stack = [{
            x: startX,
            y: startY
        }];
        const pixels = [];

        while (stack.length > 0) {
            const {
                x,
                y
            } = stack.pop();
            const index = y * width + x;

            if (x < 0 || x >= width || y < 0 || y >= height || visited[index] || !mask[index]) {
                continue;
            }

            visited[index] = 1;
            pixels.push({
                x,
                y
            });

            // Check 4-connected neighbors
            stack.push({
                x: x + 1,
                y
            });
            stack.push({
                x: x - 1,
                y
            });
            stack.push({
                x,
                y: y + 1
            });
            stack.push({
                x,
                y: y - 1
            });
        }

        return {
            pixels
        };
    }

    function calculateBounds(pixels, width) {
        let minX = width,
            minY = Number.MAX_SAFE_INTEGER;
        let maxX = 0,
            maxY = 0;

        for (const pixel of pixels) {
            minX = Math.min(minX, pixel.x);
            minY = Math.min(minY, pixel.y);
            maxX = Math.max(maxX, pixel.x);
            maxY = Math.max(maxY, pixel.y);
        }

        return {
            x: minX,
            y: minY,
            width: maxX - minX + 1,
            height: maxY - minY + 1
        };
    }

    function makeChromaAreasTransparent(chromaMask, imageData) {
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const pixelIndex = i / 4;

            if (chromaMask[pixelIndex]) {
                // Set alpha to 0 for chroma key pixels
                data[i + 3] = 0;
            }
        }
    }

    function updateResultsUI() {
        resultsCount.textContent = `${detectedAreas.length} areas`;

        // Clear previous results
        detectionResults.innerHTML = '';

        if (detectedAreas.length === 0) {
            detectionResults.innerHTML = `
                        <div class="empty-state">
                            <i class="bi bi-border-style"></i>
                            <p>No areas detected</p>
                            <small>Load a template and detect areas to get started</small>
                        </div>
                    `;
            return;
        }

        // Add each detected area to the UI
        detectedAreas.forEach(area => {
            const areaElement = document.createElement('div');
            areaElement.className = 'area-card';

            areaElement.innerHTML = `
                        <div class="area-header">
                            <span>Area <span class="area-id">${area.id}</span></span>
                            <small class="text-muted">${area.bounds.width} × ${area.bounds.height}</small>
                        </div>
                        <div class="area-controls">
                            <div class="control-row">
                                <label>X:</label>
                                <input type="range" class="form-range position-x" min="0" max="${templateCanvas.width}" value="${area.photoX}" data-area-id="${area.id}">
                                <span class="value-display x-value">${area.photoX}</span>
                            </div>
                            <div class="control-row">
                                <label>Y:</label>
                                <input type="range" class="form-range position-y" min="0" max="${templateCanvas.height}" value="${area.photoY}" data-area-id="${area.id}">
                                <span class="value-display y-value">${area.photoY}</span>
                            </div>
                            <div class="control-row">
                                <label>Scale:</label>
                                <input type="range" class="form-range scale" min="0.1" max="3" step="0.1" value="${area.photoScale}" data-area-id="${area.id}">
                                <span class="value-display scale-value">${area.photoScale}</span>
                            </div>
                            <button class="btn btn-sm btn-outline-primary load-photo-btn" data-area-id="${area.id}">
                                <i class="bi bi-upload me-1"></i>${area.photo ? 'Change Photo' : 'Load Photo'}
                            </button>
                        </div>
                    `;

            detectionResults.appendChild(areaElement);
        });

        // Add event listeners to the controls
        document.querySelectorAll('.load-photo-btn').forEach(button => {
            button.addEventListener('click', function() {
                const areaId = parseInt(this.getAttribute('data-area-id'));
                showCropModal(areaId);
            });
        });

        document.querySelectorAll('.position-x').forEach(slider => {
            slider.addEventListener('input', function() {
                const areaId = parseInt(this.getAttribute('data-area-id'));
                const area = detectedAreas.find(a => a.id === areaId);
                if (area) {
                    area.photoX = parseInt(this.value);
                    this.nextElementSibling.textContent = this.value;
                    redrawPhotos();
                }
            });
        });

        document.querySelectorAll('.position-y').forEach(slider => {
            slider.addEventListener('input', function() {
                const areaId = parseInt(this.getAttribute('data-area-id'));
                const area = detectedAreas.find(a => a.id === areaId);
                if (area) {
                    area.photoY = parseInt(this.value);
                    this.nextElementSibling.textContent = this.value;
                    redrawPhotos();
                }
            });
        });

        document.querySelectorAll('.scale').forEach(slider => {
            slider.addEventListener('input', function() {
                const areaId = parseInt(this.getAttribute('data-area-id'));
                const area = detectedAreas.find(a => a.id === areaId);
                if (area) {
                    area.photoScale = parseFloat(this.value);
                    this.nextElementSibling.textContent = this.value;
                    redrawPhotos();
                }
            });
        });
    }

    function showCropModal(areaId) {
        currentCropArea = detectedAreas.find(a => a.id === areaId);
        if (!currentCropArea) return;

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(e) {
                cropImage.src = e.target.result;
                cropAreaId.textContent = areaId;
                cropModal.show();

                // Initialize cropper with aspect ratio of the area
                if (currentCropper) {
                    currentCropper.destroy();
                }

                currentCropper = new Cropper(cropImage, {
                    aspectRatio: currentCropArea.bounds.width / currentCropArea.bounds.height,
                    viewMode: 1,
                    autoCropArea: 1,
                    responsive: true,
                    restore: false,
                    guides: true,
                    center: true,
                    highlight: false,
                    cropBoxMovable: true,
                    cropBoxResizable: true,
                    toggleDragModeOnDblclick: false
                });
            };
            reader.readAsDataURL(file);
        });

        input.click();
    }

    function applyCropToArea() {
        if (!currentCropper || !currentCropArea) return;

        // Get cropped canvas at original resolution for maximum quality
        const croppedCanvas = currentCropper.getCroppedCanvas();

        // Create image from canvas
        const img = new Image();
        img.onload = function() {
            currentCropArea.photo = img;
            // Set initial scale to fit the area perfectly
            currentCropArea.photoScale = Math.min(
                currentCropArea.bounds.width / img.width,
                currentCropArea.bounds.height / img.height
            );

            redrawPhotos();
            updateResultsUI();
            statusText.textContent = `Photo cropped and loaded for area ${currentCropArea.id}`;
        };
        img.src = croppedCanvas.toDataURL('image/png');

        cropModal.hide();
        if (currentCropper) {
            currentCropper.destroy();
            currentCropper = null;
        }
    }

    function redrawPhotos() {
        // Clear the photo canvas
        photoCtx.clearRect(0, 0, photoCanvas.width, photoCanvas.height);

        // Draw each photo with high-quality settings
        photoCtx.imageSmoothingEnabled = true;
        photoCtx.imageSmoothingQuality = 'high';

        detectedAreas.forEach(area => {
            if (area.photo) {
                const scaledWidth = area.photo.width * area.photoScale;
                const scaledHeight = area.photo.height * area.photoScale;

                photoCtx.drawImage(
                    area.photo,
                    area.photoX,
                    area.photoY,
                    scaledWidth,
                    scaledHeight
                );
            }
        });
    }

    function showCameraOptions() {
        // Populate camera options if not already done
        if (cameraSelect.children.length <= 1) {
            populateCameraOptions();
        }
        cameraOptionsModal.show();
    }

    function populateCameraOptions() {
        navigator.mediaDevices.enumerateDevices()
            .then(devices => {
                const videoDevices = devices.filter(device => device.kind === 'videoinput');
                cameraSelect.innerHTML = '<option value="">Select Camera</option>';

                videoDevices.forEach((device, index) => {
                    const option = document.createElement('option');
                    option.value = device.deviceId;
                    option.text = device.label || `Camera ${index + 1}`;
                    if (currentCameraId === device.deviceId) {
                        option.selected = true;
                    }
                    cameraSelect.appendChild(option);
                });
            })
            .catch(err => {
                console.error('Error enumerating devices:', err);
            });
    }

    function applyCameraOptionsHandler() {
        const selectedCamera = cameraSelect.value;
        const resolution = resolutionSelect.value;
        const isMirrored = mirrorPreview.checked;

        // Apply mirror effect if needed
        if (isMirrored) {
            webcamVideo.style.transform = 'scaleX(-1)';
        } else {
            webcamVideo.style.transform = 'scaleX(1)';
        }

        // Restart camera with new settings if camera is already running
        if (currentStream) {
            stopCamera();
            startCameraWithOptions(selectedCamera, resolution);
        }

        cameraOptionsModal.hide();
    }

    function startCamera() {
        if (currentStream) {
            stopCamera();
            return;
        }

        // Use previously selected camera or default
        const cameraId = currentCameraId || null;
        const resolution = resolutionSelect.value || '1280x720';

        startCameraWithOptions(cameraId, resolution);
    }

    function startCameraWithOptions(cameraId, resolution) {
        const [width, height] = resolution.split('x').map(Number);

        const constraints = {
            video: {
                width: {
                    ideal: width
                },
                height: {
                    ideal: height
                }
            }
        };

        if (cameraId) {
            constraints.video.deviceId = {
                exact: cameraId
            };
        }

        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                currentStream = stream;
                currentCameraId = cameraId;
                webcamVideo.srcObject = stream;
                webcamVideo.classList.remove('d-none');
                startCameraBtn.classList.add('active');
                statusText.textContent = 'Camera started. Ready to capture.';

                // Set up the capture overlay once video is loaded
                webcamVideo.addEventListener('loadedmetadata', function() {
                    captureOverlay.width = webcamVideo.videoWidth;
                    captureOverlay.height = webcamVideo.videoHeight;
                    captureOverlay.classList.remove('d-none');
                    updateCaptureOverlay();

                    // Update detached preview if active
                    if (isPreviewDetached && detachedPreview) {
                        const detachedVideo = detachedPreview.querySelector('#webcamVideo');
                        const detachedOverlay = detachedPreview.querySelector('#captureOverlay');
                        detachedVideo.srcObject = stream;
                        detachedOverlay.width = webcamVideo.videoWidth;
                        detachedOverlay.height = webcamVideo.videoHeight;
                    }
                });
            })
            .catch(err => {
                console.error('Error accessing camera:', err);
                statusText.textContent = 'Error accessing camera.';
            });
    }

    function stopCamera() {
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
            currentStream = null;
            webcamVideo.classList.add('d-none');
            captureOverlay.classList.add('d-none');
            startCameraBtn.classList.remove('active');

            // Also stop detached preview if active
            if (isPreviewDetached && detachedPreview) {
                const detachedVideo = detachedPreview.querySelector('#webcamVideo');
                detachedVideo.srcObject = null;
            }

            statusText.textContent = 'Camera stopped.';
        }
    }

    function toggleDetachPreview() {
        if (isPreviewDetached) {
            // Reattach preview
            if (detachedPreview) {
                document.body.removeChild(detachedPreview);
                detachedPreview = null;
            }

            // Show the preview in the sidebar again
            webcamPreview.classList.remove('d-none');
            detachPreviewBtn.innerHTML = '<i class="bi bi-arrows-move"></i> Detach Preview';
            isPreviewDetached = false;
        } else {
            // Detach preview
            if (!currentStream) {
                statusText.textContent = 'Please start the camera first.';
                return;
            }

            // Create detached preview window
            detachedPreview = document.createElement('div');
            detachedPreview.className = 'detachable-preview';
            detachedPreview.innerHTML = `
                        <div class="webcam-preview">
                            <video id="webcamVideoDetached" autoplay playsinline></video>
                            <canvas id="captureOverlayDetached"></canvas>
                            <div id="countdownOverlayDetached" class="countdown-overlay d-none">
                                <div class="countdown-number">10</div>
                                <div class="countdown-message">Get ready!</div>
                            </div>
                        </div>
                        <div class="preview-controls">
                            <button class="btn btn-sm btn-outline-secondary" id="reattachPreviewBtn">
                                <i class="bi bi-arrows-angle-contract"></i> Reattach
                            </button>
                        </div>
                    `;

            document.body.appendChild(detachedPreview);

            // Copy current stream to detached preview
            const detachedVideo = detachedPreview.querySelector('#webcamVideoDetached');
            const detachedOverlay = detachedPreview.querySelector('#captureOverlayDetached');
            const detachedCountdown = detachedPreview.querySelector('#countdownOverlayDetached');

            detachedVideo.srcObject = currentStream;
            detachedVideo.classList.remove('d-none');
            detachedOverlay.width = captureOverlay.width;
            detachedOverlay.height = captureOverlay.height;
            detachedOverlay.classList.remove('d-none');

            // Make the detached preview draggable
            makeElementDraggable(detachedPreview);

            // Add reattach button event listener
            detachedPreview.querySelector('#reattachPreviewBtn').addEventListener('click', toggleDetachPreview);

            // Hide the preview in the sidebar
            webcamPreview.classList.add('d-none');
            detachPreviewBtn.innerHTML = '<i class="bi bi-arrows-angle-contract"></i> Reattach Preview';
            isPreviewDetached = true;
        }
    }

    function makeElementDraggable(element) {
        let pos1 = 0,
            pos2 = 0,
            pos3 = 0,
            pos4 = 0;
        element.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // Get the mouse cursor position at startup
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // Call a function whenever the cursor moves
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // Calculate the new cursor position
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // Set the element's new position
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            // Stop moving when mouse button is released
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    function updateCaptureOverlay() {
        if (!webcamVideo.videoWidth || !detectedAreas.length) return;

        // Find the next area without a photo
        const emptyArea = detectedAreas.find(area => !area.photo);

        if (!emptyArea) {
            // All areas have photos, clear the overlay
            captureOverlayCtx.clearRect(0, 0, captureOverlay.width, captureOverlay.height);
            currentCaptureArea = null;

            // Also update detached preview if active
            if (isPreviewDetached && detachedPreview) {
                const detachedOverlay = detachedPreview.querySelector('#captureOverlayDetached');
                const detachedCtx = detachedOverlay.getContext('2d');
                detachedCtx.clearRect(0, 0, detachedOverlay.width, detachedOverlay.height);
            }
            return;
        }

        currentCaptureArea = emptyArea;

        // Clear the overlay
        captureOverlayCtx.clearRect(0, 0, captureOverlay.width, captureOverlay.height);

        // Calculate the dimension box for the capture area
        const videoAspect = captureOverlay.width / captureOverlay.height;
        const areaAspect = emptyArea.bounds.width / emptyArea.bounds.height;

        let boxWidth, boxHeight;

        if (videoAspect > areaAspect) {
            // Video is wider than the area aspect ratio
            boxHeight = captureOverlay.height;
            boxWidth = boxHeight * areaAspect;
        } else {
            // Video is taller than the area aspect ratio
            boxWidth = captureOverlay.width;
            boxHeight = boxWidth / areaAspect;
        }

        const boxX = (captureOverlay.width - boxWidth) / 2;
        const boxY = (captureOverlay.height - boxHeight) / 2;

        // Draw a semi-transparent overlay outside the dimension box
        captureOverlayCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        captureOverlayCtx.fillRect(0, 0, captureOverlay.width, captureOverlay.height);

        // Clear the inside of the dimension box
        captureOverlayCtx.clearRect(boxX, boxY, boxWidth, boxHeight);

        // Draw the dimension box border
        captureOverlayCtx.strokeStyle = '#ffc107';
        captureOverlayCtx.lineWidth = 3;
        captureOverlayCtx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        // Add dimension label
        captureOverlayCtx.fillStyle = '#ffc107';
        captureOverlayCtx.font = 'bold 14px Arial';
        captureOverlayCtx.fillText(
            `${emptyArea.bounds.width} × ${emptyArea.bounds.height}`,
            boxX + 10,
            boxY + 20
        );

        // Add area ID label
        captureOverlayCtx.fillText(
            `Area ${emptyArea.id}`,
            boxX + 10,
            boxY + boxHeight - 10
        );

        // Store dimension box for capture
        dimensionBox = {
            x: boxX,
            y: boxY,
            width: boxWidth,
            height: boxHeight
        };

        // Also update detached preview if active
        if (isPreviewDetached && detachedPreview) {
            const detachedOverlay = detachedPreview.querySelector('#captureOverlayDetached');
            const detachedCtx = detachedOverlay.getContext('2d');

            // Clear the overlay
            detachedCtx.clearRect(0, 0, detachedOverlay.width, detachedOverlay.height);

            // Draw a semi-transparent overlay outside the dimension box
            detachedCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            detachedCtx.fillRect(0, 0, detachedOverlay.width, detachedOverlay.height);

            // Clear the inside of the dimension box
            detachedCtx.clearRect(boxX, boxY, boxWidth, boxHeight);

            // Draw the dimension box border
            detachedCtx.strokeStyle = '#ffc107';
            detachedCtx.lineWidth = 3;
            detachedCtx.strokeRect(boxX, boxY, boxWidth, boxHeight);

            // Add dimension label
            detachedCtx.fillStyle = '#ffc107';
            detachedCtx.font = 'bold 14px Arial';
            detachedCtx.fillText(
                `${emptyArea.bounds.width} × ${emptyArea.bounds.height}`,
                boxX + 10,
                boxY + 20
            );

            // Add area ID label
            detachedCtx.fillText(
                `Area ${emptyArea.id}`,
                boxX + 10,
                boxY + boxHeight - 10
            );
        }
    }

    function captureFromWebcam() {
        if (!currentStream || !currentCaptureArea || !dimensionBox) {
            statusText.textContent = 'Please start the camera and ensure there are empty areas.';
            return;
        }

        // Create a temporary canvas for capturing at full resolution
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = dimensionBox.width;
        tempCanvas.height = dimensionBox.height;

        // Draw the current video frame at full resolution
        tempCtx.drawImage(
            webcamVideo,
            dimensionBox.x, dimensionBox.y, dimensionBox.width, dimensionBox.height, // source rect (from video)
            0, 0, dimensionBox.width, dimensionBox.height // destination rect (to canvas)
        );

        // Create an image from the canvas
        const img = new Image();
        img.onload = function() {
            currentCaptureArea.photo = img;
            // Set initial scale to fit the area perfectly
            currentCaptureArea.photoScale = Math.min(
                currentCaptureArea.bounds.width / img.width,
                currentCaptureArea.bounds.height / img.height
            );

            redrawPhotos();
            updateResultsUI();
            statusText.textContent = `Photo captured for area ${currentCaptureArea.id}`;

            // Update the capture overlay for the next empty area
            updateCaptureOverlay();
        };
        img.src = tempCanvas.toDataURL('image/png');
    }

    function toggleAutoCapture() {
        if (!currentStream) {
            statusText.textContent = 'Please start the camera first.';
            return;
        }

        if (!detectedAreas.length) {
            statusText.textContent = 'Please detect areas first.';
            return;
        }

        if (isAutoCaptureActive) {
            // Stop auto capture
            stopAutoCapture();
            autoCaptureBtn.textContent = 'Auto Capture';
            autoCaptureBtn.classList.remove('active');
            statusText.textContent = 'Auto capture stopped.';
        } else {
            // Start auto capture
            isAutoCaptureActive = true;
            autoCaptureBtn.textContent = 'Stop Auto Capture';
            autoCaptureBtn.classList.add('active');
            statusText.textContent = 'Auto capture started. Getting ready...';

            startAutoCaptureSequence();
        }
    }

    function startAutoCaptureSequence() {
        // Find the next area without a photo
        const emptyArea = detectedAreas.find(area => !area.photo);

        if (!emptyArea) {
            // All areas are filled
            stopAutoCapture();
            statusText.textContent = 'All areas are filled. Auto capture completed.';
            return;
        }

        currentCaptureArea = emptyArea;
        updateCaptureOverlay();

        const idleTime = parseInt(idleTimeSlider.value) * 1000;
        const countdownTime = parseInt(countdownTimeSlider.value) * 1000;

        // Start idle countdown
        startCountdown(idleTime, countdownTime, 'Get ready!', 'Photo will be taken soon!');
    }

    function startCountdown(idleTime, countdownTime, idleMessage, countdownMessage) {
        let remainingTime = idleTime;
        const countdownStep = 1000; // Update every second

        // Show countdown overlay
        countdownOverlay.classList.remove('d-none');
        countdownNumber.textContent = Math.ceil(remainingTime / 1000);
        countdownMessage.textContent = idleMessage;

        // Also update detached preview if active
        if (isPreviewDetached && detachedPreview) {
            const detachedCountdown = detachedPreview.querySelector('#countdownOverlayDetached');
            const detachedNumber = detachedCountdown.querySelector('.countdown-number');
            const detachedMsg = detachedCountdown.querySelector('.countdown-message');
            detachedCountdown.classList.remove('d-none');
            detachedNumber.textContent = Math.ceil(remainingTime / 1000);
            detachedMsg.textContent = idleMessage;
        }

        const countdownInterval = setInterval(() => {
            remainingTime -= countdownStep;
            countdownNumber.textContent = Math.ceil(remainingTime / 1000);

            // Also update detached preview if active
            if (isPreviewDetached && detachedPreview) {
                const detachedCountdown = detachedPreview.querySelector('#countdownOverlayDetached');
                const detachedNumber = detachedCountdown.querySelector('.countdown-number');
                detachedNumber.textContent = Math.ceil(remainingTime / 1000);
            }

            if (remainingTime <= 0) {
                clearInterval(countdownInterval);

                // Start photo countdown
                startPhotoCountdown(countdownTime, countdownMessage);
            }
        }, countdownStep);

        // Store the interval ID so we can clear it if needed
        autoCaptureInterval = countdownInterval;
    }

    function startPhotoCountdown(countdownTime, message) {
        let remainingTime = countdownTime;
        const countdownStep = 1000; // Update every second

        countdownMessage.textContent = message;

        // Also update detached preview if active
        if (isPreviewDetached && detachedPreview) {
            const detachedCountdown = detachedPreview.querySelector('#countdownOverlayDetached');
            const detachedMsg = detachedCountdown.querySelector('.countdown-message');
            detachedMsg.textContent = message;
        }

        const countdownInterval = setInterval(() => {
            remainingTime -= countdownStep;
            countdownNumber.textContent = Math.ceil(remainingTime / 1000);

            // Also update detached preview if active
            if (isPreviewDetached && detachedPreview) {
                const detachedCountdown = detachedPreview.querySelector('#countdownOverlayDetached');
                const detachedNumber = detachedCountdown.querySelector('.countdown-number');
                detachedNumber.textContent = Math.ceil(remainingTime / 1000);
            }

            if (remainingTime <= 0) {
                clearInterval(countdownInterval);

                // Take the photo
                takeAutoCapturePhoto();
            }
        }, countdownStep);

        // Store the interval ID so we can clear it if needed
        autoCaptureInterval = countdownInterval;
    }

    function takeAutoCapturePhoto() {
        // Hide countdown overlay
        countdownOverlay.classList.add('d-none');

        // Also update detached preview if active
        if (isPreviewDetached && detachedPreview) {
            const detachedCountdown = detachedPreview.querySelector('#countdownOverlayDetached');
            detachedCountdown.classList.add('d-none');
        }

        // Capture the photo
        captureFromWebcam();

        // Wait a moment then move to next area
        setTimeout(() => {
            if (isAutoCaptureActive) {
                startAutoCaptureSequence();
            }
        }, 1000);
    }

    function stopAutoCapture() {
        isAutoCaptureActive = false;

        if (autoCaptureInterval) {
            clearInterval(autoCaptureInterval);
            autoCaptureInterval = null;
        }

        if (autoCaptureTimeout) {
            clearTimeout(autoCaptureTimeout);
            autoCaptureTimeout = null;
        }

        // Hide countdown overlay
        countdownOverlay.classList.add('d-none');

        // Also update detached preview if active
        if (isPreviewDetached && detachedPreview) {
            const detachedCountdown = detachedPreview.querySelector('#countdownOverlayDetached');
            detachedCountdown.classList.add('d-none');
        }
    }

    function exportImage() {
        if (!originalTemplate) {
            statusText.textContent = 'Please load a template first.';
            return;
        }

        const fileName = exportFileName.value || '';
        const dpi = parseInt(exportDPI.value);

        // Show loading overlay
        loadingOverlay.style.display = 'flex';

        // Use setTimeout to allow the UI to update before starting the heavy processing
        setTimeout(() => {
            // Calculate scale factor for DPI
            const scale = dpi / 96;

            // Create a high-resolution canvas
            const exportCanvas = document.createElement('canvas');
            exportCanvas.width = templateCanvas.width * scale;
            exportCanvas.height = templateCanvas.height * scale;
            const exportCtx = exportCanvas.getContext('2d');

            // Set ultra-high quality rendering
            exportCtx.imageSmoothingEnabled = true;
            exportCtx.imageSmoothingQuality = 'high';

            // Draw the photos at high resolution with premium quality
            detectedAreas.forEach(area => {
                if (area.photo) {
                    const scaledWidth = area.photo.width * area.photoScale * scale;
                    const scaledHeight = area.photo.height * area.photoScale * scale;

                    // Use high-quality image rendering
                    exportCtx.drawImage(
                        area.photo,
                        area.photoX * scale,
                        area.photoY * scale,
                        scaledWidth,
                        scaledHeight
                    );
                }
            });

            // Draw the template at high resolution
            exportCtx.drawImage(
                templateCanvas,
                0, 0, templateCanvas.width, templateCanvas.height,
                0, 0, exportCanvas.width, exportCanvas.height
            );

            // Convert to blob with specified quality and trigger download
            exportCanvas.toBlob(function(blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${fileName}.jpg`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                statusText.textContent = `Premium quality image exported as ${fileName}.jpg at ${dpi} DPI`;
                loadingOverlay.style.display = 'none';
                exportModal.hide();
            }, 'image/jpeg', exportQuality);
        }, 100);
    }

    function createGIF() {
        // Get photos with their current cropping and scaling
        const photos = detectedAreas
            .filter(area => area.photo)
            .sort((a, b) => a.id - b.id); // Sort by area ID

        if (photos.length === 0) {
            statusText.textContent = 'No photos available to create GIF. Please add photos first.';
            return;
        }

        const fileName = gifFileName.value || 'photo-slideshow';
        const frameDuration = parseInt(gifFrameDuration.value);
        const quality = parseInt(gifQuality.value);
        const width = parseInt(gifWidth.value);
        const height = parseInt(gifHeight.value);

        // Show loading overlay
        loadingOverlay.style.display = 'flex';
        loadingText.textContent = 'Creating high-quality GIF...';

        // Use setTimeout to allow the UI to update
        setTimeout(() => {
            try {
                // Create GIF instance with high quality settings
                const gif = new GIF({
                    workers: 4,
                    quality: quality, // Lower number = higher quality
                    width: width,
                    height: height,
                    workerScript: 'gif.worker.js', // Make sure this file is in the same directory
                    background: '#ffffff', // White background
                    dither: false // No dithering for cleaner images
                });

                // Add each photo as a frame
                photos.forEach(area => {
                    // Create a canvas for the frame
                    const frameCanvas = document.createElement('canvas');
                    frameCanvas.width = width;
                    frameCanvas.height = height;
                    const frameCtx = frameCanvas.getContext('2d');

                    // Set high quality rendering
                    frameCtx.imageSmoothingEnabled = true;
                    frameCtx.imageSmoothingQuality = 'high';

                    // Fill with white background
                    frameCtx.fillStyle = '#ffffff';
                    frameCtx.fillRect(0, 0, width, height);

                    // Calculate scaling to fit the photo in the frame while maintaining aspect ratio
                    const photoAspect = area.photo.width / area.photo.height;
                    const frameAspect = width / height;

                    let drawWidth, drawHeight, offsetX, offsetY;

                    if (photoAspect > frameAspect) {
                        // Photo is wider than frame - fit to width
                        drawWidth = width;
                        drawHeight = width / photoAspect;
                        offsetX = 0;
                        offsetY = (height - drawHeight) / 2;
                    } else {
                        // Photo is taller than frame - fit to height
                        drawHeight = height;
                        drawWidth = height * photoAspect;
                        offsetX = (width - drawWidth) / 2;
                        offsetY = 0;
                    }

                    // Draw the photo centered in the frame
                    frameCtx.drawImage(
                        area.photo,
                        offsetX,
                        offsetY,
                        drawWidth,
                        drawHeight
                    );

                    // Add frame to GIF with specified duration
                    gif.addFrame(frameCanvas, {
                        delay: frameDuration
                    });
                });

                // Render the GIF
                gif.on('finished', function(blob) {
                    // Create download link
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${fileName}.gif`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);

                    loadingOverlay.style.display = 'none';
                    gifExportModal.hide();
                    statusText.textContent = `High-quality GIF exported as ${fileName}.gif with ${photos.length} frames`;
                });

                gif.on('progress', function(p) {
                    loadingText.textContent = `Creating GIF... ${Math.round(p * 100)}%`;
                });

                gif.render();
            } catch (error) {
                console.error('Error creating GIF:', error);
                loadingOverlay.style.display = 'none';
                statusText.textContent = 'Error creating GIF. Please try again.';
            }
        }, 100);
    }

    function startDrag(e) {
        const rect = photoCanvas.getBoundingClientRect();
        const scaleX = photoCanvas.width / rect.width;
        const scaleY = photoCanvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        // Find which area (if any) was clicked
        for (let i = detectedAreas.length - 1; i >= 0; i--) {
            const area = detectedAreas[i];
            if (area.photo &&
                x >= area.photoX && x <= area.photoX + (area.photo.width * area.photoScale) &&
                y >= area.photoY && y <= area.photoY + (area.photo.height * area.photoScale)) {

                dragTarget = area;
                isDragging = true;
                dragOffset.x = x - area.photoX;
                dragOffset.y = y - area.photoY;
                photoCanvas.style.cursor = 'grabbing';
                break;
            }
        }
    }

    function drag(e) {
        if (!isDragging || !dragTarget) return;

        const rect = photoCanvas.getBoundingClientRect();
        const scaleX = photoCanvas.width / rect.width;
        const scaleY = photoCanvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        dragTarget.photoX = x - dragOffset.x;
        dragTarget.photoY = y - dragOffset.y;

        // Update UI sliders
        const xSlider = document.querySelector(`.position-x[data-area-id="${dragTarget.id}"]`);
        const ySlider = document.querySelector(`.position-y[data-area-id="${dragTarget.id}"]`);

        if (xSlider) {
            xSlider.value = dragTarget.photoX;
            xSlider.nextElementSibling.textContent = Math.round(dragTarget.photoX);
        }

        if (ySlider) {
            ySlider.value = dragTarget.photoY;
            ySlider.nextElementSibling.textContent = Math.round(dragTarget.photoY);
        }

        redrawPhotos();
    }

    function endDrag() {
        isDragging = false;
        dragTarget = null;
        photoCanvas.style.cursor = 'default';
    }

    function resetApp() {
        originalTemplate = null;
        detectedAreas = [];
        nextAreaId = 1;

        templateCtx.clearRect(0, 0, templateCanvas.width, templateCanvas.height);
        photoCtx.clearRect(0, 0, photoCanvas.width, photoCanvas.height);
        updateResultsUI();

        // Stop auto capture if active
        if (isAutoCaptureActive) {
            stopAutoCapture();
            autoCaptureBtn.textContent = 'Auto Capture';
            autoCaptureBtn.classList.remove('active');
        }

        // Stop camera if active
        if (currentStream) {
            stopCamera();
        }

        // Reattach preview if detached
        if (isPreviewDetached) {
            toggleDetachPreview();
        }

        statusText.textContent = 'Application reset. Ready to load template.';
    }

    // Adjust canvas size when window is resized
    window.addEventListener('resize', adjustCanvasDisplaySize);
});