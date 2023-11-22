build:
	g++ -o dbeaver_fmt main.cpp beautify.cpp

debug: build
	./dbeaver_fmt $(FPATH) --debug

run: build
	./dbeaver_fmt $(FPATH)