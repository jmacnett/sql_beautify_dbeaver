'use strict';

const wsregex = /[\t\r\n ]+/gm;
const seperators = /[\t\r\n ;]+/gm;
//const word = /^.*[\t\r\n ;]+/;
const word = /^.*?[\s;\,]+/;
const leadingwhitespaceregex = /^[\t\r\n ]+/gm;
const trailingwhitespace = /[\t\r\n ]+$/;
const inlinecommentregex = /--.*$/gm;
const blockcommentregex = /\/\*[\s\S]*?\*\//gm;

const myindent = 5;

const keywords = [
    { 
        rekey: /^select?[\s]+/i, 
        tf: (x, state) => {
            // strip spaces from our select
            x = x.replace(wsregex,'');
            state.indent += myindent;
            state.inListBlock = true;
            state.stayInline = true;
            return x;
        }
    },
    { 
        rekey: /^delete?[\s]+/i, 
        tf: (x, state) => {
            // strip spaces from our select
            x = x.replace(wsregex,'');
            state.indent += myindent;
            state.inListBlock = true;
            state.stayInline = true;
            return x;
        }
    },
    { 
        rekey: /^update?[\s]+/i, 
        tf: (x, state) => {
            // strip spaces from our select
            x = x.replace(wsregex,'');
            state.indent += myindent;
            state.inListBlock = true;
            state.stayInline = true;
            return x;
        }
    },
    {
        rekey: /^from?[\s]+/i,
        tf: (x, state) => {
            state.indent -= myindent;

            // handle whitespace
            x = x.replace(wsregex,'').padStart(state.indent, ' ');
            x = '\n' + x;
            state.inListBlock = false;
            state.stayInline = true;
            return x;
        }
    },
    {
        rekey: /^where?[\s]+/i,
        tf: (x, state) => {
            x = x.replace(wsregex,'').padStart(state.indent, ' ');
            x = '\n' + x;
            state.stayInline = true;
            state.indent += myindent;
            return x;
        }
    },
    {
        rekey: /^and?[\s]+/i,
        tf: (x, state) => {
            x = x.replace(wsregex,'');
            x = '\n' + x.padStart(state.indent, ' ');
            return x;
        }
    }
]

function processNext(remaining, processed, state) {
    
    // at this point, we know there's no leading whitespace

    // TBD: should we treat commas as individual tokens?  seems like yes?

    // TODO: other special cases
    if(remaining.search(blockcommentregex) === 0) {
        let next = remaining.match(blockcommentregex)[0];
        remaining = remaining.replace(next, '');
        //next = `\n\n${next}\n\n`;
        processed.push(next);
        return remaining;
    }
    if(remaining.search(inlinecommentregex) === 0) {
        let next = remaining.match(inlinecommentregex)[0];
        remaining = remaining.replace(next, '');
        //next = `\n${next}\n`;
        processed.push(next);
        return remaining;
    }

    if(remaining.search(leadingwhitespaceregex) === 0) {
        // remove leading whitespace
        remaining = remaining.replace(leadingwhitespaceregex, '');
        return remaining;
    }

    // experimenting w/ gathering all tokens first
    if(remaining.search(word) !== -1) {
        let next = remaining.match(word)[0];
        remaining = remaining.replace(next, '');
        // remove trailling whitespace
        next = next.replace(/[\s]+$/, '');

        let trail;

        if(next.match(/,$/)) {
            trail = ',';
            next = next.replace(/,$/,'');
        }
        if(next.match(/;$/)) {
            trail = ';';
            next = next.replace(/;$/,'');
        }

        processed.push(next);
        if(trail) 
            processed.push(trail);
        return remaining;
    }

    // we're presumably at the end; grab what's left and end it
    if(remaining.length > 0) {
        processed.push(remaining);
        remaining = '';
    }
        
    return remaining;
}


/*
    compare formats to check:
    > < = <> != >= <= 
        expr "(a op b)"
    between
        expr "(a between b and c)"
*/

function stitch(tokens, state) {

    let composited = '';

    while(tokens.length > 0) {
        let token = tokens.shift();

        if(token.match(blockcommentregex)) {
            composited += '\n' + token + '\n';
            continue;
        }
        if(token.match(inlinecommentregex)) {
            composited += ' ' + token + '\n';
            continue;
        }

        switch(token.toLowerCase()) {
            case ';':
                composited += token + '\n\n';
                state.indent = 0;
                delete state.inquery;
                break;
            case ',':
                composited += '\n' + token.padStart(state.indent, ' ');
                break;
            case 'select':
            case 'insert':
            case 'update':
            case 'delete':
            case 'truncate':
                if(!state.inquery) {
                    state.indent = 0;
                    composited += '\n';
                    state.inquery = token;
                }
                composited += token;
                state.indent += myindent;
                break;
            case 'from':
            case 'where':
                state.indent -= myindent;
                composited += '\n' + token.padStart(state.indent, ' ');
                break;
            default:
                composited += ' ' + token;
                break;
        }

    }

    return composited;
}

module.exports.process = function (rawsql) {
    let remaining = rawsql;
    let tokenized = [];
    const state = {
        indent: 0,
        inListBlock: false,
        stayInline: false
    };
    while(remaining.length > 0) {
        remaining = processNext(remaining, tokenized, state);
    }

    // debug
    console.log(tokenized);
    console.log('------------------');

    // process the tokens and construct our final statement 
    return stitch(tokenized, state);

    //return blocks;
    return tokenized.join(' ');
}