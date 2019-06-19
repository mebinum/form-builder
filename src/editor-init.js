var langTools = ace.require("ace/ext/language_tools");
var snippetManager = ace.require("ace/snippets").snippetManager;

// var htmlResultEditor = ace.edit("html-result-editor");
// htmlResultEditor.setTheme("ace/theme/monokai");
// htmlResultEditor.session.setMode("ace/mode/html");

var editor = ace.edit("editor");
editor.setOptions({
    enableBasicAutocompletion:false,
    enableSnippets: true,
    enableLiveAutocompletion: true
});
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/formbuilder");
editor.session.on('change', debounce(function() {
    parseForm();
}, 600));

var keywords = "form;name;header;method;autocomplete;action;section;field;type;required;placeholder;icon;value;hint;label;validations;maxlength;minlength;end validations;end field".split(";");
var vars = null;
var consts = "post;get;on;off;textarea;textbox;phone;email;url;number;date;time;hidden;search;checkboxgroup;radiogroup;submit;select;combo;datepicker".split(";");

// create a completer object with a required callback function:
var formBuilderCompleter = {
    getCompletions: function(editor, session, pos, prefix, callback) {
        var completions = [];
        keywords.forEach(function (kw) {
            completions.push({value:kw, scrore:1001, meta:"Keyword"})
        });
        consts.forEach(function (c) {
            completions.push({value:c, score:1000, meta:"Enum"})
        });
        completions.push({value:"f-text", score:999, meta:"Snippet"});
        completions.push({value:"f-email", score:999, meta:"Snippet"});
        completions.push({value:"f-phone", score:999, meta:"Snippet"});
        completions.push({value:"f-url", score:999, meta:"Snippet"});
        callback(null, completions);
    }
};
langTools.setCompleters([]);
// finally, bind to langTools:
langTools.addCompleter(formBuilderCompleter);



var snippets = [];// snippetManager.parseSnippetFile("snippet test\n  TEST!");
snippets.push({
    content: `field
    name \${1:fieldname}
    type textbox
    required
    placeholder \${2:placeholder_text}
    value \${3:default_value}
    label \${4:field_label}
    hint \${5:field_hint}
    validations
        minlength 1
        maxlength 50
    end validations
end field`,
    name: "Text Field",
    tabTrigger: "f-text"
});
snippets.push({
    content: `field
    name \${1:email}
    type email
    icon fas fa-envelope
    required
    placeholder \${2:Please enter your email}
    value \${3:default_value}
    label \${4:Email}
    hint \${5:We hate spam too. We will never spam you.}
    validations
        minlength 1
        maxlength 50
    end validations
end field`,
    name: "Email Field",
    tabTrigger: "f-email"
});
snippets.push({
    content: `field
    name \${1:phone}
    type phone
    icon fas fa-phone
    required
    placeholder \${2:Please enter your phone}
    value \${3:default_value}
    label \${4:Phone}
    hint \${5:field_hint}
    validations
        minlength 1
        maxlength 50
    end validations
end field`,
    name: "Phone Field",
    tabTrigger: "f-phone"
});
snippets.push({
    content: `field
    name \${1:website}
    type url
    icon fas fa-globe
    required
    placeholder \${2:placeholder_text}
    value \${3:default_value}
    label \${4:Website}
    hint \${5:field_hint}
    validations
        minlength 1
        maxlength 250
    end validations
end field`,
    name: "URL Field",
    tabTrigger: "f-url"
});
snippets.push({
    content: `field
    name \${1:message}
    type textarea
    icon fas fa-comment-alt
    required
    placeholder \${2:We would love to hear what you have to say}
    value \${3:default_value}
    label \${4:Message}
    hint \${5:field_hint}
    validations
        minlength 1
        maxlength 1500
    end validations
end field`,
    name: "Textarea Field",
    tabTrigger: "f-textarea"
});

snippetManager.register(snippets, "formbuilder");


function initAddButtons() {
   document.querySelectorAll(".add-item").forEach(el => {
       el.onclick = e => {
           addSnippet(e.target.dataset.fieldname);
       }
   }) ;
}

initAddButtons();

function getHtml() {
    document.querySelector("#html-result-editor code").innerHTML = escapeHtml(formHtml);
    // document.querySelector("#copyToClipboard").dataset.dataClipboardText = formHtml;
    uglipop({class:'my-styling-class', //styling class for Modal
        source:'div', //'div' instead of 'html'
        content:'html-result'});
}

document.querySelector("#gethtml").onclick = getHtml;

function addSnippet(fname) {
    //TODO: add indent
    editor.find("end form");
    editor.navigateLineStart();
    editor.insert("\n");
    editor.navigateUp();
    snippetManager.insertSnippet(editor,snippetManager.getSnippetByName(fname,editor).content);
}

function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}
let formHtml;
function parseForm() {
    let parser = new nearley.Parser(grammar);
    let formText = editor.getValue();
    parser.feed(formText);
    let formJson = parser.results[0];
    console.log(formJson);
//        jsonResultEditor.setValue(JSON.stringify(formJson, null,2));
    formHtml = builder(formJson);
    document.querySelector("#form").innerHTML = formHtml;
}
parseForm(); //first time


function escapeHtml(text) {
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };

    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function handleCopy() {
    let clipboard = new ClipboardJS('#copyToClipboard', {
        text: function(trigger) {
            return formHtml;
        }
    });
    clipboard.on('success', function(e) {
        console.info('Action:', e.action);
        console.info('Text:', e.text);
        console.info('Trigger:', e.trigger);

        e.clearSelection();
    });

    clipboard.on('error', function(e) {
        console.error('Action:', e.action);
        console.error('Trigger:', e.trigger);
    });
}

handleCopy();
