
var logger = {
    level: 2,
    timestamp: true,
    colors: {
        "5": '\u001b[31m',
        "4": '\u001b[33m',
        "3": '\u001b[32m',
        "2": '\u001b[34m',
        reset: '\u001b[0m'
    },
    text: {
        "0": "silly",
        "1": "debug",
        "2": "verbose",
        "3": "info",
        "4": "warn",
        "5": "error"
    },
    maxLength: 224,

    silly: function(obj) {
        this.log(0, obj);
    },
    debug: function(obj) {
        this.log(1, obj);
    },
    verbose: function(obj) {
        this.log(2, obj);
    },
    info: function(obj) {
        this.log(3, obj);
    },
    warn: function(obj) {
        this.log(4, obj);
    },
    error: function(obj) {
        this.log(5, obj);
    },
    log: function(level, obj) {
        if (level >= this.level) {
            var str;
            if (typeof obj !== "string") {
                str = JSON.stringify(obj);
            } else {
                str = obj;
            }

            if (this.colors[level]) {
                str = this.colors[level] + this.text[level] + this.colors["reset"] + ": " + str;
            } else {
                str = this.text[level] + ": " + str;
            }

            if (this.timestamp) {
                var ts = new Date();


                str =   ts.getFullYear() + '-' +
                    ("0" + (ts.getMonth() + 1).toString(10)).slice(-2) + '-' +
                    ("0" + (ts.getDate() + 1).toString(10)).slice(-2) + ' ' +
                    ("0" + (ts.getHours()).toString(10)).slice(-2) + ':' +
                    ("0" + (ts.getMinutes()).toString(10)).slice(-2) + ':' +
                    ("0" + (ts.getSeconds()).toString(10)).slice(-2) + "." +
                    ("00" + (ts.getMilliseconds()).toString(10)).slice(-3) + " " +
                    str;
            }

            if (str.length > this.maxLength) {
                str = str.slice(0, this.maxLength - 4) + " ...";
            }

            console.log(str);
        }
    }
}

module.exports = logger;