#include "beautify.h"
#include <iostream>
#include <bits/stdc++.h>
#include <regex>
#include <vector>
using namespace std;

string trim(std::string s, char t) 
{
    s.erase(0, s.find_first_not_of(t));
    s.erase(s.find_last_not_of(t) + 1);
    return s;
}

//string[] BLOCK_START = {"SELECT", "INSERT", "UPDATE", "DELETE", "TRUNCATE"};

string beautify(string raw)
{
    /*
        The overall strategy here is to attempt to identify common "blocks"
        (e.g. SELECT ... FROM ... WHERE ... ORDER BY, etc), and then apply formatting
        to them.  We'll basically be attempting to parse words from the string, and use
        those as our markers (as well as semicolons, as appropriate).

        To do this in a less variant sort of way, we should actually try to minimize
        the script first, then re-expand into the formatted version.
    */

    // create regex to strip all seperator characters in favor of a single string
    string delimiter = " ";

    //std:regex spchars("[\t\r\n ]+");
    std:regex spchars("[\t\r ]+");
    string normalized = trim(std::regex_replace(raw, spchars, delimiter),' ');

    // extract each token
    std::vector<string> arr;
    
    size_t pos = 0;
    std::string token;
    while ((pos = normalized.find(delimiter)) != std::string::npos) {
        token = normalized.substr(0, pos);
        arr.push_back(token);
        //std::cout << token << std::endl;
        normalized.erase(0, pos + delimiter.length());
    }
    arr.push_back(normalized);
    //std::cout << normalized << std::endl;

    // at this point, we need to process our tokens into blocks

    int masterindent = 0;
    string processed;

    for(string n : arr) {
        processed.append(n);
        //std::cout << n << std::endl;
    }

    // std::size_t pos = normalized.find(" ");
    // std::size_t lastpos = 0;
    // while(pos != string::npos) {
    //     cout << normalized.substr(lastpos, pos) << endl;

    //     lastpos = pos + 1;
    //     pos = normalized.find(" ", lastpos);
    // }

    return processed;
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