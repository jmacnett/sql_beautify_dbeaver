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
            x = x.replace(wsregex,''); //.padStart(state.indent, ' ');
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

    // TODO: other special cases
    if(remaining.search(blockcommentregex) === 0) {
        let next = remaining.match(blockcommentregex)[0];
        remaining = remaining.replace(next, '');
        next = `\n\n${next}\n\n`;
        processed.push(next);
        return remaining;
    }
    if(remaining.search(inlinecommentregex) === 0) {
        let next = remaining.match(inlinecommentregex)[0];
        remaining = remaining.replace(next, '');
        next = `\n${next}\n`;
        processed.push(next);
        return remaining;
    }

    if(remaining.search(leadingwhitespaceregex) === 0) {
        // remove leading whitespace
        remaining = remaining.replace(leadingwhitespaceregex, '');
        return remaining;
    }


    // default behavior: return next token, based on non-seperator characters followed by a seperatore (or end of line)
    if(remaining.search(word) !== -1) {
        let next = remaining.match(word)[0];
        remaining = remaining.replace(next, '');

        if(next.match(/;/)) {
            const scsplit = next.replace(trailingwhitespace,'').split(';');
            processed.push(`${scsplit[0] === ';' ? scsplit.shift() : ' ' + scsplit.shift() + ';'}\n\n`);

            // revisit; should we shove this back on the remaining stack?
            processed.push(...scsplit);
            return remaining;
        }

        // check for extra processing requirements
        let extra = keywords.find(r=> r.rekey.test(next) && r.tf);
        if(extra) {
            //console.log(`found extra: ${next}`);
            next = extra.tf(next, state);
        }
        else {
            // trim start & end ws seperators
            next = next.replace(trailingwhitespace, '')
                .replace(leadingwhitespaceregex, '');

            // defaults
            if(state.stayInline) {
                if(/[\s]/.test(next)) {
                    next = next.replace(/\s/g, '');
                }
                next = ' ' + next;
                //state.stayInline = false;
            }
            else {
                if(state.inListBlock) {
                    if(next.indexOf(',') !== -1) {
                        next = next.replace(',','');
                        next = ',' + next;
                    }
                }
                next = next.padStart(state.stayInline ? 1 : state.indent, ' ');
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