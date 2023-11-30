#include "beautify.h"
#include <iostream>
#include <bits/stdc++.h>
#include <regex>
#include <vector>
using namespace std;

/* utility functions */
string trim(std::string s, char t) 
{
    s.erase(0, s.find_first_not_of(t));
    s.erase(s.find_last_not_of(t) + 1);
    return s;
}

std::vector<string> split(string raw, string delimiter)
{
    // extract each token
    std::vector<string> arr;
    
    size_t pos = 0;
    std::string token;
    while ((pos = raw.find(delimiter)) != std::string::npos) {
        token = raw.substr(0, pos);
        arr.push_back(token);
        //std::cout << token << std::endl;
        raw.erase(0, pos + delimiter.length());
    }
    arr.push_back(raw);

    return arr;
}

std::queue<string> splitToQueue(string raw, string delimiter)
{
    // extract each token
    std::queue<string> arr;
    
    size_t pos = 0;
    std::string token;
    while ((pos = raw.find(delimiter)) != std::string::npos) {
        token = raw.substr(0, pos);
        arr.push(token);
        //std::cout << token << std::endl;
        raw.erase(0, pos + delimiter.length());
    }
    arr.push(raw);

    return arr;
}

class CodeBlock
{
    private:
    string _rawblock;
    int _baseindent;
    bool _debug;
    vector<string> BLOCK_START = {"select", "insert", "update", "delete", "truncate", "("};
    vector<string> BLOCK_INNER_KEYWORDS = { "from", "where", "order", "set" };
    vector<string> BLOCK_END = {")", ";"};

    string normalize(string raw, string delimiter = " ")
    {
        if(raw.empty())
            return raw;

        // create regex to strip all seperator characters in favor of a single string
        std:regex spchars("[\t\r\n ]+");
        //std:regex spchars("[\t\r ]+");
        return trim(std::regex_replace(raw, spchars, delimiter),' ');
    }

    void appendIndented(size_t currentIndent, string& tgt, string toAppend, string prefix="", string trail = "")
    {
        tgt.append(currentIndent, ' ');
        tgt.append(prefix);
        tgt.append(toAppend);
        tgt.append(trail);
    }

    public:
    CodeBlock(string rawblock, int indent = 0, bool debug = false)
    {
        _rawblock = rawblock;
        _baseindent = indent;
        _debug = debug;
    }

    string Process() 
    {
        // this will be our formatter logic
        string normalized = normalize(_rawblock);
        if(normalized.empty())
            return "";

        // return normalized;

        // ***TODO: we need to detect comment lines here (// and /* */ formats) and preserve their location for re-insertion

        // split into tokens
        vector<string> tokens = split(normalized," ");
        string processed;
        bool inBlock = false;

        // process our tokens; our first token should start our block, but eh
        int workingIndent = _baseindent;
        for(string tkn : tokens)
        {
            vector<string>::iterator found;

            // get lowercase token
            string utkn = tkn;
            std:transform(tkn.begin(), tkn.end(), utkn.begin(), [](unsigned char c){ return std::tolower(c); });

            // if(_debug) 
            //     cout << tkn << endl;
            // if(_debug) 
            //     cout << "working indent: " << workingIndent << endl;

            // check for block starters
            found = find (BLOCK_START.begin(), BLOCK_START.end(), utkn);
            if(found != BLOCK_START.end()) 
            {
                if(inBlock) 
                {
                    // if we find another block starter and we're already in a block, it's nested;
                    // pass to another level
                    //appendIndented(workingIndent, )
                    //cout << "/* found a sub-block! */"  << endl;
                    appendIndented(workingIndent, processed, "/* found a sub-block! */" , "", " ");
                    appendIndented(workingIndent, processed, tkn , "", " ");
                }
                else 
                {
                    if(_debug) 
                        cout << "found a block!" << endl;
                    // we found a major block item; write it and continue
                    appendIndented(workingIndent, processed, tkn, "", " ");
                    inBlock = true;
                    workingIndent += 5;
                }
                continue;
            }

            // check for in-block newline values (e.g. commas, FROM clauses, etc)
            vector<string>::iterator found2;
            found2 = find (BLOCK_INNER_KEYWORDS.begin(), BLOCK_INNER_KEYWORDS.end(), utkn);
            if(found2 != BLOCK_INNER_KEYWORDS.end()) 
            {
                if(_debug)
                    cout << "in secondary block!" << endl;
                workingIndent -= 5;
                if(workingIndent < 0)
                    workingIndent = 0;

                appendIndented(workingIndent, processed, tkn, "\n", " ");
                continue;
            }

            // if we reach this point, append with a space and continue
            appendIndented(workingIndent, processed, tkn, "", " ");
        }



        return processed;
    }
};

string beautify(string raw, bool debug = false)
{
    /*
        The overall strategy here is to attempt to identify common "blocks"
        (e.g. SELECT ... FROM ... WHERE ... ORDER BY, etc), and then apply formatting
        to them.  We'll basically be attempting to parse words from the string, and use
        those as our markers (as well as semicolons, as appropriate).

        To do this in a less variant sort of way, we should actually try to minimize
        the script first, then re-expand into the formatted version.
    */

    // new strategy: split the statements based on the ';' character, then format each
    std::vector<string> blockarr = split(raw, ";");
    
    std::stringstream processed;
    for(string bl : blockarr)
    {
        string lres = trim((new CodeBlock(bl, 0, debug))->Process(), ' ');
        //string lres = bl;
        // processed.append(lres);
        // processed.append(std::endl);
        if(!lres.empty())
            processed << lres << ';' << std::endl << std::endl;
    }

    return processed.str();

    // size_t bpos = 0;

    // // create regex to strip all seperator characters in favor of a single string
    // string delimiter = " ";

    // std:regex spchars("[\t\r\n ]+");
    // //std:regex spchars("[\t\r ]+");
    // string normalized = trim(std::regex_replace(raw, spchars, delimiter),' ');

    // // extract each token
    // std::vector<string> arr;
    
    // size_t pos = 0;
    // std::string token;
    // while ((pos = normalized.find(delimiter)) != std::string::npos) {
    //     token = normalized.substr(0, pos);
    //     arr.push_back(token);
    //     //std::cout << token << std::endl;
    //     normalized.erase(0, pos + delimiter.length());
    // }
    // arr.push_back(normalized);
    // //std::cout << normalized << std::endl;

    // // at this point, we need to process our tokens into blocks

    // int masterindent = 0;
    // string processed;

    // for(string n : arr) {
    //     processed.append(n);
    //     //std::cout << n << std::endl;
    // }

    // return processed;

    // std::size_t pos = normalized.find(" ");
    // std::size_t lastpos = 0;
    // while(pos != string::npos) {
    //     cout << normalized.substr(lastpos, pos) << endl;

    //     lastpos = pos + 1;
    //     pos = normalized.find(" ", lastpos);
    // }

    
    //return ""; //processed;

    // // parse our string, hopefully
    

    // // variable to store token obtained from the original
    // // string
    // string token;

    // // constructing stream from the string
    // stringstream ss(raw);

    // // declaring vector to store the string after split
    // vector<string> v;

    // // using while loop until the getline condition is
    // // satisfied
    // // ' ' represent split the string whenever a space is
    // // found in the original string
    // int cnt = 0;
    // int pos = 0;
    // while((pos = getNextToken(pos, raw, token)) != -1)
    // {
    //     //cout << pos;

    //     token = "||" + token;
    //     // store token string in the vector
    //     v.push_back(token);

    //     cnt++;
    //     if(cnt > 5)
    //         break;
    // }
    // // while (getline(ss, token, ' ')) {
    // //     token = "--" + token;
    // //     // store token string in the vector
    // //     v.push_back(token);
    // // }

    // // print the vector
    // string processed;
    // for (int i = 0; i < v.size(); i++) {
    //     processed.append(v[i]);
    //     //cout << v[i] << endl;
    // }

    // string processed = raw;
    // processed.append("\ncows22444");
    //return processed;
}