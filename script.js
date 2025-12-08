document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEYS = {
        sidebar: 'sira_sidebar_html',
        events: 'sira_events_content',
        tarajim: 'sira_tarajim_data'
    };

    const state = {
        tarajimData: {},
        eventsCache: {},
        currentEventId: '',
        activeLinkId: null,
        isCreatingNew: false,
        newLinkKeyword: '',
        currentImgData: null,
        suppressSelectionClose: false
    };

    const elements = {
        sidebar: document.getElementById('sidebar-data'),
        editableContent: document.getElementById('editable-content'),
        tooltip: document.getElementById('smart-tooltip'),
        tooltipContent: document.getElementById('tooltip-content'),
        popover: document.getElementById('smart-editor-popover'),
        popoverTitle: document.getElementById('popover-title'),
        popoverContent: document.getElementById('popover-content'),
        popoverFile: document.getElementById('popover-file'),
        popoverImgPreview: document.getElementById('popover-img-preview-container'),
        popoverSaveBtn: document.getElementById('popover-save-btn'),
        closePopoverBtn: document.querySelector('.close-popover'),
        removeImgBtn: document.getElementById('remove-img-btn')
    };

    const floatBtn = createSelectionButton();
    const sidebarAddBtn = createSidebarAddButton();
    const sidebarRemoveBtn = createSidebarRemoveButton();
    const sidebarMenu = createSidebarMenu();
    const exportBackupBtn = document.getElementById('export-backup-btn');
    const importBackupInput = document.getElementById('import-backup-input');
    const toolbarButtons = document.querySelectorAll('.editor-toolbar button');
    const textColorPicker = document.getElementById('text-color-picker');
    const highlightColorPicker = document.getElementById('highlight-color-picker');
    let hoveredSidebarItem = null;
    let sidebarHideTimer = null;

    init();

    function init() {
        loadInitialData();
        bindSidebarEvents();
        bindContentEvents();
        bindPopoverEvents();
        bindSelectionButtonEvents();
        bindSidebarMenuEvents();
        bindBackupControls();
        bindFormattingControls();
        bindGlobalEvents();
        applySmartLinks();
    }

    function loadInitialData() {
        state.eventsCache = readFromStorage(STORAGE_KEYS.events, {});
        state.tarajimData = readFromStorage(STORAGE_KEYS.tarajim, {});

        if (elements.sidebar) {
            const storedSidebar = localStorage.getItem(STORAGE_KEYS.sidebar);
            if (storedSidebar && storedSidebar.trim()) {
                elements.sidebar.innerHTML = storedSidebar;
            }
        }

        const activeLi = elements.sidebar ? elements.sidebar.querySelector('li.active[data-event-id]') : null;
        const fallbackLi = elements.sidebar ? elements.sidebar.querySelector('li[data-event-id]') : null;
        const targetLi = activeLi || fallbackLi;

        if (targetLi) {
            targetLi.classList.add('active');
            loadEventContent(targetLi.dataset.eventId);
        } else {
            elements.editableContent.innerHTML = '';
            elements.editableContent.dataset.currentEventId = '';
            state.currentEventId = '';
        }
    }

    function bindBackupControls() {
        if (exportBackupBtn) {
            exportBackupBtn.addEventListener('click', handleExportBackup);
        }
        if (importBackupInput) {
            importBackupInput.addEventListener('change', handleImportBackup);
        }
    }

    function bindFormattingControls() {
        if (toolbarButtons.length) {
            toolbarButtons.forEach((btn) => {
                btn.addEventListener('click', () => {
                    const command = btn.dataset.command;
                    if (!command) return;
                    applyFormatting(command);
                });
            });
        }

        if (textColorPicker) {
            textColorPicker.addEventListener('input', (e) => {
                applyFormatting('foreColor', e.target.value);
            });
        }

        if (highlightColorPicker) {
            highlightColorPicker.addEventListener('input', (e) => {
                applyFormatting('hiliteColor', e.target.value);
            });
        }
    }

    function readFromStorage(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return fallback;
            return JSON.parse(raw);
        } catch (err) {
            console.error(`Failed to parse storage item ${key}`, err);
            return fallback;
        }
    }

    function bindSidebarEvents() {
        const { sidebar } = elements;
        if (!sidebar) return;

        sidebar.addEventListener('input', saveSidebarStructure);
        sidebar.addEventListener('click', handleSidebarClick);
        sidebar.addEventListener('keydown', handleSidebarKeydown);
    }

    function bindContentEvents() {
        elements.editableContent.addEventListener('input', saveCurrentEvent);
        elements.editableContent.addEventListener('mousedown', () => {
            hideSelectionButton();
            closePopover();
        });
    }

    function bindPopoverEvents() {
        elements.popoverSaveBtn.addEventListener('click', handlePopoverSave);
        elements.closePopoverBtn.addEventListener('click', closePopover);
        elements.popoverFile.addEventListener('change', handleFileChange);
        elements.removeImgBtn.addEventListener('click', () => {
            state.currentImgData = null;
            elements.popoverFile.value = '';
            updateImgPreview();
        });
    }

    function bindSelectionButtonEvents() {
        elements.editableContent.addEventListener('mouseup', () => setTimeout(handleSelectionDisplay, 10));
        elements.editableContent.addEventListener('keyup', () => setTimeout(handleSelectionDisplay, 10));

        document.addEventListener('mousedown', (e) => {
            if (!floatBtn.contains(e.target)) {
                hideSelectionButton();
            }
        });

        floatBtn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        floatBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const keyword = floatBtn.dataset.selectedText;
            if (!keyword) return;
            openPopover(floatBtn, { keyword });
            hideSelectionButton();
        });
    }

    function bindSidebarMenuEvents() {
        const { sidebar } = elements;
        if (!sidebar) return;

        sidebar.addEventListener('mousemove', (e) => {
            const target = e.target.closest('li, h3');
            if (!target) return;
            hoveredSidebarItem = target;
            const rect = target.getBoundingClientRect();
            const top = rect.top + window.scrollY;
            const left = rect.left + window.scrollX;
            sidebarAddBtn.style.display = 'block';
            sidebarAddBtn.style.top = `${top}px`;
            sidebarAddBtn.style.left = `${left - 30}px`;
            sidebarRemoveBtn.style.display = 'block';
            sidebarRemoveBtn.style.top = `${top}px`;
            sidebarRemoveBtn.style.left = `${left - 65}px`;
        });

        sidebar.addEventListener('mouseleave', () => {
            sidebarHideTimer = setTimeout(() => {
                if (!sidebarAddBtn.matches(':hover') && !sidebarRemoveBtn.matches(':hover') && !sidebarMenu.matches(':hover')) {
                    sidebarAddBtn.style.display = 'none';
                    sidebarRemoveBtn.style.display = 'none';
                    sidebarMenu.style.display = 'none';
                }
            }, 100);
        });

        sidebarAddBtn.addEventListener('mouseenter', () => clearTimeout(sidebarHideTimer));
        sidebarRemoveBtn.addEventListener('mouseenter', () => clearTimeout(sidebarHideTimer));
        sidebarMenu.addEventListener('mouseenter', () => clearTimeout(sidebarHideTimer));

        sidebarAddBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!hoveredSidebarItem) return;
            const rect = sidebarAddBtn.getBoundingClientRect();
            sidebarMenu.style.display = 'block';
            sidebarMenu.style.top = `${rect.bottom + window.scrollY}px`;
            sidebarMenu.style.left = `${rect.left + window.scrollX}px`;
        });

        sidebarRemoveBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!hoveredSidebarItem) return;
            removeSidebarItem(hoveredSidebarItem);
        });

        sidebarMenu.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (!action || !hoveredSidebarItem) return;
            if (action === 'add-event') {
                addNewEvent(hoveredSidebarItem);
            } else if (action === 'add-year') {
                addNewYear(hoveredSidebarItem);
            }
            sidebarMenu.style.display = 'none';
            sidebarAddBtn.style.display = 'none';
        });
    }

    function bindGlobalEvents() {
        document.addEventListener('click', handleDocumentClick);
        document.addEventListener('selectionchange', handleSelectionChange);
        window.addEventListener('resize', hideTooltip);
        window.addEventListener('scroll', () => {
            hideTooltip();
            hideSelectionButton();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closePopover();
                hideTooltip();
                hideSelectionButton();
            }
        });
    }

    function saveSidebarStructure() {
        if (!elements.sidebar) return;
        localStorage.setItem(STORAGE_KEYS.sidebar, elements.sidebar.innerHTML);
    }

    function handleSidebarClick(e) {
        const li = e.target.closest('li[data-event-id]');
        if (!li) return;
        activateSidebarItem(li);
        loadEventContent(li.dataset.eventId);
    }

    function handleSidebarKeydown(e) {
        if (e.key !== 'Enter') return;
        const target = getSidebarTargetFromSelection();
        if (!target) return;
        e.preventDefault();
        addNewEvent(target);
    }

    function activateSidebarItem(li) {
        elements.sidebar.querySelectorAll('li').forEach(item => item.classList.remove('active'));
        li.classList.add('active');
    }

    function loadEventContent(eventId) {
        const events = getEventsMap();
        const content = Object.prototype.hasOwnProperty.call(events, eventId) ? events[eventId] : '';
        elements.editableContent.innerHTML = content;
        elements.editableContent.dataset.currentEventId = eventId;
        state.currentEventId = eventId;
        applySmartLinks();
    }

    function getEventsMap() {
        return state.eventsCache || {};
    }

    function saveCurrentEvent() {
        const eventId = elements.editableContent.dataset.currentEventId;
        if (!eventId) return;
        const events = getEventsMap();
        const html = elements.editableContent.innerHTML;
        events[eventId] = html;
        state.eventsCache = events;
        localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(events, null, 4));
    }

    function handlePopoverSave() {
        const keyword = state.isCreatingNew ? state.newLinkKeyword : (state.tarajimData[state.activeLinkId]?.كلمة_مفتاحية || '');
        const saveId = state.isCreatingNew ? `link_${Date.now()}` : state.activeLinkId;
        if (!keyword || !saveId) {
            alert('لا توجد كلمة مفتاحية مرتبطة بهذه الترجمة.');
            return;
        }

        const targetData = state.tarajimData[saveId] ? { ...state.tarajimData[saveId] } : {};
        targetData.كلمة_مفتاحية = state.isCreatingNew ? keyword : (targetData.كلمة_مفتاحية || keyword);
        targetData.العنوان = elements.popoverTitle.value.trim();
        targetData.المحتوى = elements.popoverContent.value.trim();
        targetData.صورة = state.currentImgData;

        state.tarajimData[saveId] = targetData;
        persistTarajimData();
        closePopover();
        hideSelectionButton();
        const selection = window.getSelection();
        if (selection && selection.removeAllRanges) {
            selection.removeAllRanges();
        }
    }

    function handleFileChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            state.currentImgData = event.target.result;
            updateImgPreview();
        };
        reader.readAsDataURL(file);
    }

    function applySmartLinks() {
        if (!elements.editableContent) return;

        elements.editableContent.querySelectorAll('a.smart-link').forEach(link => {
            link.replaceWith(document.createTextNode(link.textContent));
        });

        const keywords = Object.entries(state.tarajimData)
            .filter(([, data]) => data && data.كلمة_مفتاحية)
            .map(([id, data]) => ({ id, keyword: data.كلمة_مفتاحية }))
            .sort((a, b) => b.keyword.length - a.keyword.length);

        keywords.forEach(({ id, keyword }) => wrapKeyword(id, keyword));
        attachSmartLinkListeners();
    }

    function applyFormatting(command, value = null) {
        let cmd = command;
        if (typeof document.queryCommandSupported === 'function' && !document.queryCommandSupported(command)) {
            if (command === 'hiliteColor' && document.queryCommandSupported('backColor')) {
                cmd = 'backColor';
            } else {
                console.warn(`Command ${command} is not supported`);
                return;
            }
        }
        elements.editableContent.focus();
        document.execCommand(cmd, false, value);
        saveCurrentEvent();
    }

    function wrapKeyword(linkId, keyword) {
        if (!keyword) return;
        const walker = document.createTreeWalker(elements.editableContent, NodeFilter.SHOW_TEXT, null, false);

        while (walker.nextNode()) {
            let node = walker.currentNode;
            if (!node.nodeValue || !node.nodeValue.trim()) continue;
            if (node.parentElement && node.parentElement.closest('a.smart-link')) continue;

            while (node && node.nodeValue) {
                const index = node.nodeValue.indexOf(keyword);
                if (index === -1) break;

                const beforeChar = node.nodeValue[index - 1];
                const afterChar = node.nodeValue[index + keyword.length];
                if (!isBoundary(beforeChar) || !isBoundary(afterChar)) {
                    const skipIndex = index + keyword.length;
                    node = node.splitText(skipIndex);
                    continue;
                }

                const matchNode = node.splitText(index);
                const restNode = matchNode.splitText(keyword.length);

                const link = document.createElement('a');
                link.className = 'smart-link';
                link.dataset.linkId = linkId;
                link.textContent = matchNode.nodeValue;

                matchNode.replaceWith(link);
                node = restNode;
            }
        }
    }

    function isBoundary(char) {
        if (char === undefined || char === null) return true;
        return !/[\u0600-\u06FF]/.test(char);
    }

    function attachSmartLinkListeners() {
        elements.editableContent.querySelectorAll('.smart-link').forEach(link => {
            if (link.dataset.bound === 'true') return;
            link.dataset.bound = 'true';
            link.addEventListener('mouseenter', () => showTooltip(link));
            link.addEventListener('mouseleave', hideTooltip);
            link.addEventListener('click', (e) => {
                e.preventDefault();
                openPopover(link, { linkId: link.dataset.linkId });
            });
        });
    }

    function showTooltip(link) {
        const data = state.tarajimData[link.dataset.linkId];
        if (!data) return;

        let html = '';
        if (data.صورة) {
            html += `<img src="${data.صورة}" alt="صورة">`;
        }
        if (data.العنوان) {
            html += `<strong>${data.العنوان}</strong><br>`;
        }
        if (data.المحتوى) {
            html += data.المحتوى;
        }

        elements.tooltipContent.innerHTML = html || 'لا توجد بيانات.';
        elements.tooltip.classList.remove('hidden');
        const rect = link.getBoundingClientRect();
        elements.tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;
        elements.tooltip.style.left = `${rect.left + window.scrollX}px`;
    }

    function hideTooltip() {
        elements.tooltip.classList.add('hidden');
        elements.tooltipContent.innerHTML = '';
    }

    function openPopover(triggerElement, { linkId = null, keyword = '' } = {}) {
        hideTooltip();
        state.isCreatingNew = !linkId;
        state.activeLinkId = linkId;
        state.newLinkKeyword = keyword.trim();

        let data = {};
        if (linkId && state.tarajimData[linkId]) {
            data = state.tarajimData[linkId];
        }

        elements.popoverTitle.value = data.العنوان || (state.isCreatingNew ? keyword : '');
        elements.popoverContent.value = data.المحتوى || '';
        state.currentImgData = data.صورة || null;
        updateImgPreview();

        elements.popover.classList.remove('hidden');
        elements.popover.classList.add('visible');
        positionPopover(triggerElement);

        state.suppressSelectionClose = true;
        requestAnimationFrame(() => {
            state.suppressSelectionClose = false;
            elements.popoverTitle.focus();
            elements.popoverTitle.select();
        });
    }

    function positionPopover(triggerElement) {
        const rect = triggerElement.getBoundingClientRect();
        const width = elements.popover.offsetWidth || 300;
        const height = elements.popover.offsetHeight || 360;

        let top = rect.bottom + window.scrollY + 10;
        let left = rect.left + window.scrollX;

        if (left + width > window.innerWidth - 10) {
            left = window.innerWidth - width - 10;
        }
        if (left < 10) left = 10;

        if (top + height > window.scrollY + window.innerHeight - 10) {
            top = rect.top + window.scrollY - height - 10;
            if (top < 10) top = 10;
        }

        elements.popover.style.top = `${top}px`;
        elements.popover.style.left = `${left}px`;
    }

    function closePopover() {
        if (!elements.popover.classList.contains('visible')) return;
        elements.popover.classList.remove('visible');
        elements.popover.classList.add('hidden');
        resetPopoverState();
    }

    function resetPopoverState() {
        state.activeLinkId = null;
        state.isCreatingNew = false;
        state.newLinkKeyword = '';
        state.currentImgData = null;
        state.suppressSelectionClose = false;
        elements.popoverTitle.value = '';
        elements.popoverContent.value = '';
        elements.popoverFile.value = '';
        elements.popoverImgPreview.innerHTML = '';
    }

    function updateImgPreview() {
        if (state.currentImgData) {
            elements.popoverImgPreview.innerHTML = `<img src="${state.currentImgData}" alt="preview">`;
            elements.removeImgBtn.style.display = 'inline-block';
        } else {
            elements.popoverImgPreview.innerHTML = '';
            elements.removeImgBtn.style.display = 'none';
        }
    }

    function persistTarajimData() {
        localStorage.setItem(STORAGE_KEYS.tarajim, JSON.stringify(state.tarajimData, null, 4));
        applySmartLinks();
    }

    function handleExportBackup() {
        try {
            const backup = {
                sidebar: localStorage.getItem(STORAGE_KEYS.sidebar) || (elements.sidebar ? elements.sidebar.innerHTML : ''),
                events: readFromStorage(STORAGE_KEYS.events, state.eventsCache || {}),
                tarajim: readFromStorage(STORAGE_KEYS.tarajim, state.tarajimData || {})
            };

            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sira-backup-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Failed to export backup', err);
            alert('تعذّر إنشاء نسخة احتياطية. حاول مرة أخرى.');
        }
    }

    function handleImportBackup(e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const backup = JSON.parse(event.target.result);
                if (backup.sidebar && typeof backup.sidebar === 'string') {
                    localStorage.setItem(STORAGE_KEYS.sidebar, backup.sidebar);
                    if (elements.sidebar) {
                        elements.sidebar.innerHTML = backup.sidebar;
                    }
                }

                if (backup.events) {
                    let events = backup.events;
                    if (typeof events === 'string') {
                        events = JSON.parse(events);
                    }
                    if (events && typeof events === 'object') {
                        state.eventsCache = events;
                        localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(events, null, 4));
                    }
                }

                if (backup.tarajim) {
                    let tarajim = backup.tarajim;
                    if (typeof tarajim === 'string') {
                        tarajim = JSON.parse(tarajim);
                    }
                    if (tarajim && typeof tarajim === 'object') {
                        state.tarajimData = tarajim;
                        localStorage.setItem(STORAGE_KEYS.tarajim, JSON.stringify(tarajim, null, 4));
                    }
                }

                loadInitialData();
                applySmartLinks();
                alert('تم استيراد البيانات بنجاح.');
            } catch (err) {
                console.error('Failed to import backup', err);
                alert('ملف النسخة الاحتياطية غير صالح.');
            } finally {
                e.target.value = '';
            }
        };
        reader.readAsText(file, 'utf-8');
    }

    function handleSelectionDisplay() {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
            hideSelectionButton();
            return;
        }
        const text = selection.toString().trim();
        if (!text) {
            hideSelectionButton();
            return;
        }
        if (!selection.rangeCount) {
            hideSelectionButton();
            return;
        }
        const range = selection.getRangeAt(0);
        if (!elements.editableContent.contains(range.commonAncestorContainer)) {
            hideSelectionButton();
            return;
        }
        showSelectionButton(range, text);
    }

    function showSelectionButton(range, text) {
        const rect = range.getBoundingClientRect();
        floatBtn.style.top = `${rect.top + window.scrollY - 35}px`;
        floatBtn.style.left = `${rect.left + window.scrollX}px`;
        floatBtn.style.display = 'block';
        floatBtn.dataset.selectedText = text;
    }

    function hideSelectionButton() {
        floatBtn.style.display = 'none';
        floatBtn.dataset.selectedText = '';
    }

    function handleDocumentClick(e) {
        if (elements.popover.classList.contains('visible')) {
            if (!elements.popover.contains(e.target) && !e.target.classList.contains('smart-link') && e.target !== floatBtn) {
                closePopover();
            }
        }

        if (!sidebarMenu.contains(e.target) && e.target !== sidebarAddBtn && e.target !== sidebarRemoveBtn) {
            sidebarMenu.style.display = 'none';
        }

        if (!elements.sidebar.contains(e.target) && e.target !== sidebarAddBtn && e.target !== sidebarRemoveBtn && !sidebarMenu.contains(e.target)) {
            sidebarAddBtn.style.display = 'none';
            sidebarRemoveBtn.style.display = 'none';
        }
    }

    function handleSelectionChange() {
        if (!elements.popover.classList.contains('visible') || state.suppressSelectionClose) return;
        const selection = document.getSelection();
        if (!selection || !selection.anchorNode) return;
        if (elements.popover.contains(selection.anchorNode)) return;
        closePopover();
    }

    function removeSidebarItem(target) {
        if (!target) return;
        const removedIds = [];

        if (target.tagName === 'LI') {
            const eventId = target.dataset.eventId;
            if (eventId) removedIds.push(eventId);
            target.remove();
        } else if (target.tagName === 'H3') {
            const nextUl = target.nextElementSibling;
            if (nextUl && nextUl.tagName === 'UL') {
                nextUl.querySelectorAll('li[data-event-id]').forEach(li => {
                    if (li.dataset.eventId) removedIds.push(li.dataset.eventId);
                });
                nextUl.remove();
            }
            target.remove();
        }

        if (removedIds.length) {
            const events = getEventsMap();
            let changed = false;
            removedIds.forEach(id => {
                if (events[id]) {
                    delete events[id];
                    changed = true;
                }
                if (state.currentEventId === id) {
                    elements.editableContent.innerHTML = '';
                    elements.editableContent.dataset.currentEventId = '';
                    state.currentEventId = '';
                }
            });
            if (changed) {
                state.eventsCache = events;
                localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(events, null, 4));
            }
        }

        saveSidebarStructure();
        hoveredSidebarItem = null;
        sidebarAddBtn.style.display = 'none';
        sidebarRemoveBtn.style.display = 'none';
        sidebarMenu.style.display = 'none';
    }

    function addNewEvent(targetItem) {
        const newId = `event_${Date.now()}`;
        const li = document.createElement('li');
        li.dataset.eventId = newId;
        li.textContent = 'موضوع جديد';

        if (targetItem.tagName === 'H3') {
            let nextUl = targetItem.nextElementSibling;
            if (!nextUl || nextUl.tagName !== 'UL') {
                nextUl = document.createElement('ul');
                targetItem.insertAdjacentElement('afterend', nextUl);
            }
            nextUl.appendChild(li);
        } else if (targetItem.tagName === 'LI') {
            targetItem.insertAdjacentElement('afterend', li);
        }

        saveSidebarStructure();
        activateSidebarItem(li);
        loadEventContent(newId);
        return li;
    }

    function addNewYear(targetItem) {
        const h3 = document.createElement('h3');
        h3.textContent = 'سنة/باب جديد';
        const ul = document.createElement('ul');

        if (targetItem.tagName === 'H3') {
            let nextUl = targetItem.nextElementSibling;
            if (nextUl && nextUl.tagName === 'UL') {
                nextUl.insertAdjacentElement('afterend', h3);
                h3.insertAdjacentElement('afterend', ul);
            } else {
                targetItem.insertAdjacentElement('afterend', h3);
                h3.insertAdjacentElement('afterend', ul);
            }
        } else if (targetItem.tagName === 'LI') {
            const parentUl = targetItem.closest('ul');
            if (parentUl) {
                parentUl.insertAdjacentElement('afterend', h3);
                h3.insertAdjacentElement('afterend', ul);
            }
        }

        saveSidebarStructure();
        return h3;
    }

    function getSidebarTargetFromSelection() {
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return null;
        let node = selection.anchorNode;
        if (!node) return null;
        const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
        if (!element) return null;
        if (!elements.sidebar.contains(element)) return null;
        return element.closest('li, h3');
    }

    function createSelectionButton() {
        const btn = document.createElement('button');
        btn.id = 'selection-action-btn';
        btn.textContent = '➕';
        document.body.appendChild(btn);
        return btn;
    }

    function createSidebarAddButton() {
        const btn = document.createElement('button');
        btn.className = 'sidebar-add-btn';
        btn.textContent = '+';
        btn.style.zIndex = '1500';
        btn.style.position = 'absolute';
        btn.style.display = 'none';
        document.body.appendChild(btn);
        return btn;
    }

    function createSidebarRemoveButton() {
        const btn = document.createElement('button');
        btn.className = 'sidebar-remove-btn';
        btn.textContent = '-';
        btn.style.zIndex = '1500';
        btn.style.position = 'absolute';
        btn.style.display = 'none';
        document.body.appendChild(btn);
        return btn;
    }

    function createSidebarMenu() {
        const menu = document.createElement('div');
        menu.className = 'sidebar-context-menu';
        menu.innerHTML = `
            <div data-action="add-event">إضافة موضوع/حدث</div>
            <div data-action="add-year">إضافة سنة/باب</div>
        `;
        document.body.appendChild(menu);
        return menu;
    }
});
