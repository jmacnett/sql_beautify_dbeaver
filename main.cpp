#include <iostream>
#include <fstream>
#include <stdio.h>
#include <sys/stat.h>
#include "beautify.h"
using namespace std;

int main(int argc, char* argv[])
{
    if(argc != 2 && argc != 3) 
    {
        cerr << "This program only accepts a single 'path' argument.\n";
        return 1;
    }

    bool debug = false;
    if(argc == 3)
        cout << "first check passed" << endl;
    // this is broken
    if(argv[2] == "--debug")
        cout << "second check passed" << endl;
    if(argc == 3 && argv[2] == "--debug") {
        debug = true;
    }
    else {
        cout << argc << endl;
        cout << argv[2] << endl;
    }
    const char* srcpath = argv[1];
    //printf("File path: %s\n", srcpath);

    // store our target path for later.  default behavior is to write back to the same file.
    string tgtpath = srcpath;
    // temp code
    //tgtpath.assign("./outtest.sql");
 
    // check if path exists
    struct stat sb;
    if (stat(srcpath, &sb) != 0)
    {
        cerr << "Provided path does not exist!\n";
        return 2;
    }

    // read file into a buffer
    string raw;
    ifstream src (srcpath);
    if(src.is_open()) 
    {
        raw.assign( (std::istreambuf_iterator<char>(src) ), (std::istreambuf_iterator<char>()) );
        src.close();
    }
    else 
    {
        cerr << "Unable to read from source file!\n";
        return 2;
    }
    
    // start our formatting
    string formatted = beautify(raw, debug);

    // this actually writes it back to dbeaver (not writing back to temp file)
    cout << formatted;

    // ofstream tgt (tgtpath,ios::trunc);
    // if(tgt.is_open()) 
    // {
    //     tgt << formatted;
    //     tgt.close();
    // }
    // else 
    // {
    //     cerr << "Unable to write to target file!\n";
    //     return 3;
    // }

    return 0;
}