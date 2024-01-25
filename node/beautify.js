'use strict';

const wsregex = /[\t\r\n ]+/gm;
const seperators = /[\t\r\n ;]+/gm;
//const word = /^.*[\t\r\n ;]+/;
const word = /^.*[\s;\,]+/;
const leadingwhitespaceregex = /^[\t\r\n ]+/gm;
const inlinecommentregex = /--.*$/gm;
const blockcommentregex = /\/\*[\s\S]*?\*\//gm;

const myindent = 5;

const keywords = [
    // { 
    //     rekey: /^select.*/i, 
    //     tf: (x, state) => {
    //         // strip spaces from our select
    //         x = x.replace(wsregex,'');
    //         state.indent += myindent;
    //         state.inListBlock = true;
    //         state.stayInline = true;
    //         return x;
    //     }
    // },
    // {
    //     rekey: /^from.*/i,
    //     tf: (x, state) => {
    //         state.indent -= myindent;

    //         // handle whitespace
    //         x = x.replace(wsregex,'').padStart(state.indent, ' ');
    //         x = '\n' + x;
    //         state.inListBlock = false;
    //         state.stayInline = true;
    //         return x;
    //     }
    // },
    // {
    //     rekey: /^where.*/i,
    //     tf: (x, state) => {
    //         x = x.replace(wsregex,'').padStart(state.indent, ' ');
    //         x = '\n' + x;
    //         state.stayInline = true;
    //         state.indent += myindent;
    //         return x;
    //     }
    // },
    // {
    //     rekey: /^and.*/i,
    //     tf: (x, state) => {
    //         x = x.replace(wsregex,'');
    //         x = '\n' + x.padStart(state.indent, ' ');
    //         return x;
    //     }
    // }
]

function processNext(remaining, processed, state) {
    if(remaining.search(leadingwhitespaceregex) === 0) {

        // remove leading whitespace
        remaining = remaining.replace(leadingwhitespaceregex, '');
        return remaining;
    }
    // at this point, we know there's no leading whitespace

    // TODO: other special cases
    if(remaining.search(blockcommentregex) === 0) {
        let next = remaining.match(blockcommentregex)[0];
        next = next + '\n';
        remaining = remaining.replace(next, '');
        processed.push(next);
        return remaining;
    }

    // default behavior: return next token, based on non-seperator characters followed by a seperatore (or end of line)
    if(remaining.search(word) !== -1) {
        let next = remaining.match(word)[0];
        remaining = remaining.replace(next, '');
        // check for extra processing requirements
        let extra = keywords.find(r=> r.rekey.test(next) && r.tf);
        if(extra) {
            next = extra.tf(next, state);
        }
        else {
            // defaults
            if(state.stayInline) {
                if(/[\n\r\t]/.test(next)) {
                    next = next.replace(/\n/g, '');
                    next = next.replace(/\r/g, '');
                    next = next.replace(/\t/g, '');
                }
                next = ' ' + next;
                state.stayInline = false;
            }
            else {
                if(state.inListBlock) {
                    if(next.indexOf(',') !== -1) {
                        next = next.replace(',','');
                        next = ',' + next;
                    }
                }
                next = next.padStart(state.indent, ' ');
            }
        }

        processed.push(next);

        return remaining;
    }
    
    // we're presumably at the end; grab what's left and end it
    if(remaining.length > 0) {
        processed.push(remaining);
        remaining = '';
    }
        
    return remaining;
}

module.exports.process = function (rawsql) {

    let remaining = rawsql;
    let processed = [];
    const state = {
        indent: 0,
        inListBlock: false,
        stayInline: false
    };
    while(remaining.length > 0) {
        remaining = processNext(remaining, processed, state);
    }

    // debug
    console.log(processed);
    console.log('------------------');

    //return blocks;
    return processed.join('');
}