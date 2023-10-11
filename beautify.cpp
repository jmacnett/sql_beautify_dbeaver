#include "beautify.h"
#include <iostream>
#include <bits/stdc++.h>
using namespace std;

string beautify(string raw)
{
    /*
        The overall strategy here is to attempt to identify common "blocks"
        (e.g. SELECT ... FROM ... WHERE ... ORDER BY, etc), and then apply formatting
        to them.  We'll basically be attempting to parse words from the string, and use
        those as our markers (as well as semicolons, as appropriate).
    */

    int* masterindent = 0;

    // parse our string, hopefully

    // variable to store token obtained from the original
    // string
    string token;
 
    // constructing stream from the string
    stringstream ss(raw);
 
    // declaring vector to store the string after split
    vector<string> v;
 
    // using while loop until the getline condition is
    // satisfied
    // ' ' represent split the string whenever a space is
    // found in the original string
    while (getline(ss, token, ' ')) {
        token = "--" + token;
        // store token string in the vector
        v.push_back(token);
    }
 
    // print the vector
    string processed;
    for (int i = 0; i < v.size(); i++) {
        processed.append(v[i]);
        //cout << v[i] << endl;
    }

    // string processed = raw;
    // processed.append("\ncows22444");
    return processed;
}