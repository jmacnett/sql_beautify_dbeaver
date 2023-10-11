build:
	g++ -o dbeaver_fmt main.cpp beautify.cpp

run: build
	./dbeaver_fmt $(FPATH)