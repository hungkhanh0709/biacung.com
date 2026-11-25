(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.BiaCungBookFormat = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    function list(value) {
        const seen = new Set();
        return (Array.isArray(value) ? value : [value]).filter((entry) => {
            if (typeof entry !== 'string') return false;
            const key = entry.trim().toLocaleLowerCase('vi');
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        }).map((entry) => entry.trim());
    }

    function fromInput(value) {
        return list(typeof value === 'string' ? value.split(/[;\r\n]+/) : value);
    }

    function text(value, separator = ' · ') {
        return list(value).join(separator);
    }

    function has(value, label) {
        return list(value).some((entry) => entry.toLocaleLowerCase('vi') === label.toLocaleLowerCase('vi'));
    }

    function valid(value) {
        return typeof value === 'string' || (Array.isArray(value) && value.every((entry) => typeof entry === 'string'));
    }

    return { list, fromInput, text, has, valid };
}));
