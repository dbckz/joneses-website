// Mock IntersectionObserver for jsdom
global.IntersectionObserver = class IntersectionObserver {
    constructor(callback, options) {
        this.callback = callback;
        this.options = options;
        this.observedElements = [];
    }

    observe(element) {
        this.observedElements.push(element);
    }

    unobserve(element) {
        this.observedElements = this.observedElements.filter(el => el !== element);
    }

    disconnect() {
        this.observedElements = [];
    }

    // Helper for testing - trigger intersection
    trigger(entries) {
        this.callback(entries, this);
    }
};

// Mock window.scrollY
Object.defineProperty(window, 'scrollY', {
    value: 0,
    writable: true
});
