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
    const cameraSettingsBtn = document.getElementById('cameraSettingsBtn');
    const togglePreviewBtn = document.getElementById('togglePreviewBtn');
    const resetCanvasBtn = document.getElementById('resetCanvasBtn');
    const resetAppBtn = document.getElementById('resetAppBtn');
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
    const startCameraBtn = document.getElementById('startCameraBtn');
    const captureBtn = document.getElementById('captureBtn');
    const webcamVideo = document.getElementById('webcamVideo');
    const captureOverlay = document.getElementById('captureOverlay');
    const captureOverlayCtx = captureOverlay.getContext('2d');
    const countdownMessage = document.getElementById('countdownMessage');
    const countdownDisplay = document.getElementById('countdownDisplay');
    const photoCaptured = document.getElementById('photoCaptured');

    // Auto capture settings
    const enableIdleTimeCheckbox = document.getElementById('enableIdleTime');
    const idleTimeContainer = document.getElementById('idleTimeContainer');
    const idleTimeSlider = document.getElementById('idleTime');
    const idleTimeValue = document.getElementById('idleTimeValue');
    const countdownTimeSlider = document.getElementById('countdownTime');
    const countdownTimeValue = document.getElementById('countdownTimeValue');

    // Movable preview elements
    const movablePreview = document.getElementById('movablePreview');
    const movableWebcamVideo = document.getElementById('movableWebcamVideo');
    const movableCaptureOverlay = document.getElementById('movableCaptureOverlay');
    const movableCaptureOverlayCtx = movableCaptureOverlay.getContext('2d');
    const movableCountdownMessage = document.getElementById('movableCountdownMessage');
    const movableCountdownDisplay = document.getElementById('movableCountdownDisplay');
    const movablePhotoCaptured = document.getElementById('movablePhotoCaptured');
    const closePreviewBtn = document.getElementById('closePreviewBtn');
    const movableStartAutoCaptureBtn = document.getElementById('movableStartAutoCaptureBtn');
    const movableStopAutoCaptureBtn = document.getElementById('movableStopAutoCaptureBtn');
    const movableEnableIdleTimeCheckbox = document.getElementById('movableEnableIdleTime');
    const movableIdleTimeContainer = document.getElementById('movableIdleTimeContainer');
    const movableIdleTimeInput = document.getElementById('movableIdleTime');
    const movableCountdownTimeInput = document.getElementById('movableCountdownTime');
    const movableMirrorPreviewCheckbox = document.getElementById('movableMirrorPreview');

    // Modal elements
    const cropModal = new bootstrap.Modal(document.getElementById('cropModal'));
    const cropImage = document.getElementById('cropImage');
    const cropAreaId = document.getElementById('cropAreaId');
    const applyCrop = document.getElementById('applyCrop');
    const exportModal = new bootstrap.Modal(document.getElementById('exportModal'));
    const exportFileName = document.getElementById('exportFileName');
    const exportDPI = document.getElementById('exportDPI');
    const exportQualityButtons = document.querySelectorAll('#exportModal .btn-outline-primary');
    const exportFolderPath = document.getElementById('exportFolderPath');
    const selectExportFolderBtn = document.getElementById('selectExportFolderBtn');
    const confirmExport = document.getElementById('confirmExport');
    const gifExportModal = new bootstrap.Modal(document.getElementById('gifExportModal'));
    const gifFileName = document.getElementById('gifFileName');
    const gifFrameDuration = document.getElementById('gifFrameDuration');
    const gifQuality = document.getElementById('gifQuality');
    const gifWidth = document.getElementById('gifWidth');
    const gifHeight = document.getElementById('gifHeight');
    const gifFolderPath = document.getElementById('gifFolderPath');
    const selectGifFolderBtn = document.getElementById('selectGifFolderBtn');
    const confirmGifExport = document.getElementById('confirmGifExport');
    const cameraSettingsModal = new bootstrap.Modal(document.getElementById('cameraSettingsModal'));
    const cameraSelect = document.getElementById('cameraSelect');
    const resolutionSelect = document.getElementById('resolutionSelect');
    const mirrorCameraCheckbox = document.getElementById('mirrorCamera');
    const autoEnableIdleTimeCheckbox = document.getElementById('autoEnableIdleTime');
    const autoIdleTimeInput = document.getElementById('autoIdleTime');
    const autoCountdownTimeInput = document.getElementById('autoCountdownTime');
    const saveCameraSettingsBtn = document.getElementById('saveCameraSettings');

    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');

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
    let isAutoCapturing = false;
    let currentAutoCaptureAreaIndex = 0;
    let isPreviewMovable = false;
    let isDraggingPreview = false;
    let previewDragOffset = {
        x: 0,
        y: 0
    };
    let exportDirectoryHandle = null;
    let gifDirectoryHandle = null;

    // Event listeners
    loadImageBtn.addEventListener('click', () => imageInput.click());
    imageInput.addEventListener('change', handleTemplateUpload);
    detectAreasBtn.addEventListener('click', detectChromaAreas);
    exportBtn.addEventListener('click', () => exportModal.show());
    createGifBtn.addEventListener('click', () => gifExportModal.show());
    autoCaptureBtn.addEventListener('click', startAutoCapture);
    cameraSettingsBtn.addEventListener('click', () => cameraSettingsModal.show());
    togglePreviewBtn.addEventListener('click', toggleMovablePreview);
    resetCanvasBtn.addEventListener('click', resetCanvas);
    resetAppBtn.addEventListener('click', resetApp);
    toleranceSlider.addEventListener('input', updateTolerance);
    minAreaSlider.addEventListener('input', updateMinArea);
    featheringSlider.addEventListener('input', updateFeathering);
    startCameraBtn.addEventListener('click', startCamera);
    captureBtn.addEventListener('click', captureFromWebcam);
    applyCrop.addEventListener('click', applyCropToArea);
    confirmExport.addEventListener('click', exportImage);
    confirmGifExport.addEventListener('click', createGIF);
    closePreviewBtn.addEventListener('click', closeMovablePreview);
    movableStartAutoCaptureBtn.addEventListener('click', startAutoCapture);
    movableStopAutoCaptureBtn.addEventListener('click', stopAutoCapture);
    saveCameraSettingsBtn.addEventListener('click', saveCameraSettings);
    movableMirrorPreviewCheckbox.addEventListener('change', updateMirrorPreview);

    // Auto capture settings
    enableIdleTimeCheckbox.addEventListener('change', toggleIdleTime);
    movableEnableIdleTimeCheckbox.addEventListener('change', toggleMovableIdleTime);
    autoEnableIdleTimeCheckbox.addEventListener('change', toggleAutoIdleTime);
    idleTimeSlider.addEventListener('input', updateIdleTime);
    countdownTimeSlider.addEventListener('input', updateCountdownTime);

    // Export quality buttons
    exportQualityButtons.forEach(button => {
        button.addEventListener('click', function() {
            exportQualityButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            exportQuality = parseFloat(this.getAttribute('data-quality'));
        });
    });

    // Folder selection
    selectExportFolderBtn.addEventListener('click', selectExportFolder);
    selectGifFolderBtn.addEventListener('click', selectGifFolder);

    // Canvas event listeners for dragging
    photoCanvas.addEventListener('mousedown', startDrag);
    photoCanvas.addEventListener('mousemove', drag);
    photoCanvas.addEventListener('mouseup', endDrag);
    photoCanvas.addEventListener('mouseleave', endDrag);

    // Movable preview drag functionality
    const previewHeader = document.querySelector('.preview-header');
    previewHeader.addEventListener('mousedown', startPreviewDrag);
    document.addEventListener('mousemove', dragPreview);
    document.addEventListener('mouseup', endPreviewDrag);

    // Initialize UI
    toggleIdleTime();
    toggleMovableIdleTime();
    toggleAutoIdleTime();

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

    function toggleIdleTime() {
        idleTimeContainer.style.display = enableIdleTimeCheckbox.checked ? 'block' : 'none';
    }

    function toggleMovableIdleTime() {
        movableIdleTimeContainer.style.display = movableEnableIdleTimeCheckbox.checked ? 'block' : 'none';
    }

    function toggleAutoIdleTime() {
        // This would be used in camera settings modal
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
        resultsCount.textContent = `${detectedAreas.length} areas detected`;

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
                            <div class="photo-controls">
                                <button class="btn-small primary load-photo-btn" data-area-id="${area.id}">
                                    <i class="bi bi-upload me-1"></i>${area.photo ? 'Change' : 'Load'}
                                </button>
                                ${area.photo ? `
                                <button class="btn-small danger delete-photo-btn" data-area-id="${area.id}">
                                    <i class="bi bi-trash me-1"></i>Delete
                                </button>
                                ` : ''}
                            </div>
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

        document.querySelectorAll('.delete-photo-btn').forEach(button => {
            button.addEventListener('click', function() {
                const areaId = parseInt(this.getAttribute('data-area-id'));
                deletePhoto(areaId);
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

    function deletePhoto(areaId) {
        const area = detectedAreas.find(a => a.id === areaId);
        if (area) {
            area.photo = null;
            redrawPhotos();
            updateResultsUI();
            statusText.textContent = `Photo deleted from area ${areaId}`;

            // Update capture overlay
            updateCaptureOverlay();
            updateMovableCaptureOverlay();
        }
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

    function startCamera() {
        if (currentStream) {
            // Stop the current stream if already running
            currentStream.getTracks().forEach(track => track.stop());
            currentStream = null;
            webcamVideo.classList.add('d-none');
            captureOverlay.classList.add('d-none');
            movableWebcamVideo.classList.add('d-none');
            movableCaptureOverlay.classList.add('d-none');
            startCameraBtn.classList.remove('active');
            statusText.textContent = 'Camera stopped.';
            return;
        }

        // Get available cameras
        navigator.mediaDevices.enumerateDevices()
            .then(devices => {
                const videoDevices = devices.filter(device => device.kind === 'videoinput');

                // Populate camera select
                cameraSelect.innerHTML = '<option value="">Select Camera</option>';
                videoDevices.forEach((device, index) => {
                    const option = document.createElement('option');
                    option.value = device.deviceId;
                    option.text = device.label || `Camera ${index + 1}`;
                    cameraSelect.appendChild(option);
                });

                if (videoDevices.length > 0) {
                    // Get selected resolution
                    const resolution = resolutionSelect.value.split('x');
                    const width = parseInt(resolution[0]);
                    const height = parseInt(resolution[1]);

                    // Try to get the selected camera or default to first
                    const selectedCamera = cameraSelect.value || videoDevices[0].deviceId;

                    const constraints = {
                        video: {
                            deviceId: selectedCamera ? {
                                exact: selectedCamera
                            } : undefined,
                            width: {
                                ideal: width
                            },
                            height: {
                                ideal: height
                            }
                        }
                    };

                    navigator.mediaDevices.getUserMedia(constraints)
                        .then(stream => {
                            currentStream = stream;
                            webcamVideo.srcObject = stream;
                            webcamVideo.classList.remove('d-none');
                            movableWebcamVideo.srcObject = stream;
                            movableWebcamVideo.classList.remove('d-none');
                            startCameraBtn.classList.add('active');
                            statusText.textContent = 'Camera started. Ready to capture.';

                            // Apply mirror effect if enabled
                            updateMirrorPreview();

                            // Set up the capture overlay once video is loaded
                            webcamVideo.addEventListener('loadedmetadata', function() {
                                captureOverlay.width = webcamVideo.videoWidth;
                                captureOverlay.height = webcamVideo.videoHeight;
                                captureOverlay.classList.remove('d-none');
                                updateCaptureOverlay();

                                movableCaptureOverlay.width = movableWebcamVideo.videoWidth;
                                movableCaptureOverlay.height = movableWebcamVideo.videoHeight;
                                movableCaptureOverlay.classList.remove('d-none');
                                updateMovableCaptureOverlay();
                            });
                        })
                        .catch(err => {
                            console.error('Error accessing camera:', err);
                            statusText.textContent = 'Error accessing camera.';
                        });
                } else {
                    statusText.textContent = 'No cameras found.';
                }
            })
            .catch(err => {
                console.error('Error enumerating devices:', err);
                statusText.textContent = 'Error accessing camera devices.';
            });
    }

    function updateMirrorPreview() {
        const isMirrored = movableMirrorPreviewCheckbox.checked || mirrorCameraCheckbox.checked;
        webcamVideo.style.transform = isMirrored ? 'scaleX(-1)' : 'scaleX(1)';
        movableWebcamVideo.style.transform = isMirrored ? 'scaleX(-1)' : 'scaleX(1)';
    }

    function updateCaptureOverlay() {
        if (!webcamVideo.videoWidth || !detectedAreas.length) return;

        // Find the next area without a photo
        const emptyArea = detectedAreas.find(area => !area.photo);

        if (!emptyArea) {
            // All areas have photos, clear the overlay
            captureOverlayCtx.clearRect(0, 0, captureOverlay.width, captureOverlay.height);
            currentCaptureArea = null;
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
    }

    function updateMovableCaptureOverlay() {
        if (!movableWebcamVideo.videoWidth || !detectedAreas.length) return;

        // Find the next area without a photo
        const emptyArea = detectedAreas.find(area => !area.photo);

        if (!emptyArea) {
            // All areas have photos, clear the overlay
            movableCaptureOverlayCtx.clearRect(0, 0, movableCaptureOverlay.width, movableCaptureOverlay.height);
            return;
        }

        // Clear the overlay
        movableCaptureOverlayCtx.clearRect(0, 0, movableCaptureOverlay.width, movableCaptureOverlay.height);

        // Calculate the dimension box for the capture area
        const videoAspect = movableCaptureOverlay.width / movableCaptureOverlay.height;
        const areaAspect = emptyArea.bounds.width / emptyArea.bounds.height;

        let boxWidth, boxHeight;

        if (videoAspect > areaAspect) {
            // Video is wider than the area aspect ratio
            boxHeight = movableCaptureOverlay.height;
            boxWidth = boxHeight * areaAspect;
        } else {
            // Video is taller than the area aspect ratio
            boxWidth = movableCaptureOverlay.width;
            boxHeight = boxWidth / areaAspect;
        }

        const boxX = (movableCaptureOverlay.width - boxWidth) / 2;
        const boxY = (movableCaptureOverlay.height - boxHeight) / 2;

        // Draw a semi-transparent overlay outside the dimension box
        movableCaptureOverlayCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        movableCaptureOverlayCtx.fillRect(0, 0, movableCaptureOverlay.width, movableCaptureOverlay.height);

        // Clear the inside of the dimension box
        movableCaptureOverlayCtx.clearRect(boxX, boxY, boxWidth, boxHeight);

        // Draw the dimension box border
        movableCaptureOverlayCtx.strokeStyle = '#ffc107';
        movableCaptureOverlayCtx.lineWidth = 3;
        movableCaptureOverlayCtx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        // Add dimension label
        movableCaptureOverlayCtx.fillStyle = '#ffc107';
        movableCaptureOverlayCtx.font = 'bold 14px Arial';
        movableCaptureOverlayCtx.fillText(
            `${emptyArea.bounds.width} × ${emptyArea.bounds.height}`,
            boxX + 10,
            boxY + 20
        );

        // Add area ID label
        movableCaptureOverlayCtx.fillText(
            `Area ${emptyArea.id}`,
            boxX + 10,
            boxY + boxHeight - 10
        );
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

        // Apply mirror effect if enabled
        if (movableMirrorPreviewCheckbox.checked || mirrorCameraCheckbox.checked) {
            tempCtx.translate(tempCanvas.width, 0);
            tempCtx.scale(-1, 1);
        }

        // Draw the current video frame at full resolution
        tempCtx.drawImage(
            webcamVideo,
            dimensionBox.x, dimensionBox.y, dimensionBox.width, dimensionBox.height, // source rect (from video)
            0, 0, tempCanvas.width, tempCanvas.height // destination rect (to canvas)
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

            // Show photo captured message
            showPhotoCaptured();

            // Update the capture overlay for the next empty area
            updateCaptureOverlay();
            updateMovableCaptureOverlay();
        };
        img.src = tempCanvas.toDataURL('image/png');
    }

    function showPhotoCaptured() {
        photoCaptured.style.display = 'block';
        movablePhotoCaptured.style.display = 'block';

        setTimeout(() => {
            photoCaptured.style.display = 'none';
            movablePhotoCaptured.style.display = 'none';
        }, 2000);
    }

    function startAutoCapture() {
        if (!currentStream) {
            statusText.textContent = 'Please start the camera first.';
            return;
        }

        if (detectedAreas.length === 0) {
            statusText.textContent = 'No areas detected. Please detect areas first.';
            return;
        }

        // Find the first empty area
        currentAutoCaptureAreaIndex = detectedAreas.findIndex(area => !area.photo);

        if (currentAutoCaptureAreaIndex === -1) {
            statusText.textContent = 'All areas already have photos.';
            return;
        }

        isAutoCapturing = true;
        autoCaptureBtn.classList.add('active');
        movableStartAutoCaptureBtn.classList.add('active');
        statusText.textContent = 'Auto capture sequence started.';

        // Start the auto capture sequence
        startAutoCaptureSequence();
    }

    function startAutoCaptureSequence() {
        if (!isAutoCapturing) return;

        // Get the current area to capture
        currentCaptureArea = detectedAreas[currentAutoCaptureAreaIndex];

        // Get idle and countdown times
        const enableIdle = enableIdleTimeCheckbox.checked || movableEnableIdleTimeCheckbox.checked;
        const idleTime = enableIdle ? (parseInt(idleTimeSlider.value) || parseInt(movableIdleTimeInput.value)) * 1000 : 0;
        const countdownTime = (parseInt(countdownTimeSlider.value) || parseInt(movableCountdownTimeInput.value)) * 1000;

        // Show idle message if enabled
        if (enableIdle && idleTime > 0) {
            showCountdownMessage('Get ready! Photo session starting soon...', true);

            // After idle time, start countdown
            setTimeout(() => {
                if (!isAutoCapturing) return;
                startCountdown(countdownTime);
            }, idleTime);
        } else {
            // Start countdown immediately
            startCountdown(countdownTime);
        }
    }

    function startCountdown(countdownTime) {
        if (!isAutoCapturing) return;

        // Show countdown message
        showCountdownMessage('Photo will be taken in:', true);

        // Start countdown
        let countdown = countdownTime / 1000;
        showCountdownDisplay(countdown);

        const countdownInterval = setInterval(() => {
            if (!isAutoCapturing) {
                clearInterval(countdownInterval);
                hideCountdowns();
                return;
            }

            countdown--;

            // Change color to red in the last 3 seconds
            if (countdown <= 3) {
                countdownDisplay.classList.add('countdown-warning');
                movableCountdownDisplay.classList.add('countdown-warning');
            }

            if (countdown > 0) {
                showCountdownDisplay(countdown);
            } else {
                clearInterval(countdownInterval);
                hideCountdowns();

                // Capture the photo
                captureFromWebcam();

                // Move to next area if available
                setTimeout(() => {
                    if (!isAutoCapturing) return;

                    currentAutoCaptureAreaIndex = detectedAreas.findIndex(area => !area.photo);

                    if (currentAutoCaptureAreaIndex !== -1) {
                        // Continue to next area
                        startAutoCaptureSequence();
                    } else {
                        // All areas captured
                        stopAutoCapture();
                        statusText.textContent = 'Auto capture sequence completed. All areas filled.';
                    }
                }, 1000);
            }
        }, 1000);
    }

    function stopAutoCapture() {
        isAutoCapturing = false;
        autoCaptureBtn.classList.remove('active');
        movableStartAutoCaptureBtn.classList.remove('active');
        hideCountdowns();
        statusText.textContent = 'Auto capture stopped.';
    }

    function showCountdownMessage(message, showInMovable = false) {
        countdownMessage.textContent = message;
        countdownMessage.style.display = 'block';

        if (showInMovable && movablePreview.style.display !== 'none') {
            movableCountdownMessage.textContent = message;
            movableCountdownMessage.style.display = 'block';
        }
    }

    function showCountdownDisplay(number, showInMovable = false) {
        countdownDisplay.textContent = number;
        countdownDisplay.style.display = 'block';

        if (showInMovable && movablePreview.style.display !== 'none') {
            movableCountdownDisplay.textContent = number;
            movableCountdownDisplay.style.display = 'block';
        }
    }

    function hideCountdowns() {
        countdownMessage.style.display = 'none';
        countdownDisplay.style.display = 'none';
        countdownDisplay.classList.remove('countdown-warning');
        movableCountdownMessage.style.display = 'none';
        movableCountdownDisplay.style.display = 'none';
        movableCountdownDisplay.classList.remove('countdown-warning');
    }

    function toggleMovablePreview() {
        if (movablePreview.style.display === 'none' || movablePreview.style.display === '') {
            movablePreview.style.display = 'block';
            togglePreviewBtn.classList.add('active');

            // Update the movable preview overlay
            updateMovableCaptureOverlay();
        } else {
            closeMovablePreview();
        }
    }

    function closeMovablePreview() {
        movablePreview.style.display = 'none';
        togglePreviewBtn.classList.remove('active');
    }

    function startPreviewDrag(e) {
        isDraggingPreview = true;
        const rect = movablePreview.getBoundingClientRect();
        previewDragOffset.x = e.clientX - rect.left;
        previewDragOffset.y = e.clientY - rect.top;
        movablePreview.style.cursor = 'grabbing';
    }

    function dragPreview(e) {
        if (!isDraggingPreview) return;

        movablePreview.style.left = (e.clientX - previewDragOffset.x) + 'px';
        movablePreview.style.top = (e.clientY - previewDragOffset.y) + 'px';
    }

    function endPreviewDrag() {
        isDraggingPreview = false;
        movablePreview.style.cursor = 'default';
    }

    function saveCameraSettings() {
        // Save settings and close modal
        cameraSettingsModal.hide();
        statusText.textContent = 'Camera settings saved.';

        // Restart camera if it's running to apply new settings
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
            currentStream = null;
            startCamera();
        }
    }

    async function selectExportFolder() {
        if ('showDirectoryPicker' in window) {
            try {
                exportDirectoryHandle = await window.showDirectoryPicker();
                exportFolderPath.value = exportDirectoryHandle.name;
            } catch (err) {
                console.error('Error selecting folder:', err);
                // Fallback to download
                exportFolderPath.value = 'Downloads (fallback)';
            }
        } else {
            // Browser doesn't support File System Access API
            exportFolderPath.value = 'Downloads (fallback)';
        }
    }

    async function selectGifFolder() {
        if ('showDirectoryPicker' in window) {
            try {
                gifDirectoryHandle = await window.showDirectoryPicker();
                gifFolderPath.value = gifDirectoryHandle.name;
            } catch (err) {
                console.error('Error selecting folder:', err);
                // Fallback to download
                gifFolderPath.value = 'Downloads (fallback)';
            }
        } else {
            // Browser doesn't support File System Access API
            gifFolderPath.value = 'Downloads (fallback)';
        }
    }

    async function exportImage() {
        if (!originalTemplate) {
            statusText.textContent = 'Please load a template first.';
            return;
        }

        const fileName = exportFileName.value || 'chroma-key-result';
        const dpi = parseInt(exportDPI.value);

        // Show loading overlay
        loadingOverlay.style.display = 'flex';

        // Use setTimeout to allow the UI to update before starting the heavy processing
        setTimeout(async () => {
            try {
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

                // Convert to blob with specified quality
                exportCanvas.toBlob(async function(blob) {
                    try {
                        if (exportDirectoryHandle) {
                            // Save to selected folder using File System Access API
                            const fileHandle = await exportDirectoryHandle.getFileHandle(`${fileName}.jpg`, {
                                create: true
                            });
                            const writable = await fileHandle.createWritable();
                            await writable.write(blob);
                            await writable.close();
                            statusText.textContent = `Premium quality image saved as ${fileName}.jpg at ${dpi} DPI`;
                        } else {
                            // Fallback to download
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${fileName}.jpg`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                            statusText.textContent = `Premium quality image exported as ${fileName}.jpg at ${dpi} DPI`;
                        }
                    } catch (err) {
                        console.error('Error saving file:', err);
                        // Fallback to download
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${fileName}.jpg`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        statusText.textContent = `Premium quality image exported as ${fileName}.jpg at ${dpi} DPI`;
                    }

                    loadingOverlay.style.display = 'none';
                    exportModal.hide();
                }, 'image/jpeg', exportQuality);
            } catch (error) {
                console.error('Error exporting image:', error);
                loadingOverlay.style.display = 'none';
                statusText.textContent = 'Error exporting image. Please try again.';
            }
        }, 100);
    }

    async function createGIF() {
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
        setTimeout(async () => {
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
                gif.on('finished', async function(blob) {
                    try {
                        if (gifDirectoryHandle) {
                            // Save to selected folder using File System Access API
                            const fileHandle = await gifDirectoryHandle.getFileHandle(`${fileName}.gif`, {
                                create: true
                            });
                            const writable = await fileHandle.createWritable();
                            await writable.write(blob);
                            await writable.close();
                            statusText.textContent = `High-quality GIF saved as ${fileName}.gif with ${photos.length} frames`;
                        } else {
                            // Fallback to download
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${fileName}.gif`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                            statusText.textContent = `High-quality GIF exported as ${fileName}.gif with ${photos.length} frames`;
                        }
                    } catch (err) {
                        console.error('Error saving GIF:', err);
                        // Fallback to download
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${fileName}.gif`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        statusText.textContent = `High-quality GIF exported as ${fileName}.gif with ${photos.length} frames`;
                    }

                    loadingOverlay.style.display = 'none';
                    gifExportModal.hide();
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

    function resetCanvas() {
        // Clear photos from all areas
        detectedAreas.forEach(area => {
            area.photo = null;
        });

        redrawPhotos();
        updateResultsUI();

        // Update capture overlays
        updateCaptureOverlay();
        updateMovableCaptureOverlay();

        statusText.textContent = 'Canvas reset. Template ready for new photos.';
    }

    function resetApp() {
        // Reload the page to clear everything
        window.location.reload();
    }

    // Adjust canvas size when window is resized
    window.addEventListener('resize', adjustCanvasDisplaySize);
});