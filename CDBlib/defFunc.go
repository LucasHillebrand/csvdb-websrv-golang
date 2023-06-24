package cdblib

func Split(initstr, keyword string) []string {
	out := make([]string, Count(initstr, keyword)+1)
	for i, col := 0, 0; i < len(initstr); i++ {
		if NextChars(initstr, i, len(keyword)) == keyword {
			i += len(keyword) - 1
			col++
		} else {
			out[col] += string(initstr[i])
		}
	}
	return out
}

func UISplit(initstr, keyword string) []string {
	out := make([]string, Count(initstr, keyword)+1)
	par := false
	for i, col := 0, 0; i < len(initstr); i++ {
		if initstr[i] == '"' {
			par = !par
		} else if NextChars(initstr, i, len(keyword)) == keyword && !par {
			i += len(keyword) - 1
			col++
		} else if !par {
			out[col] += string(initstr[i])
		} else {
			out[col] += ConvertStr(string(initstr[i]))
		}
	}
	return out
}

func Count(initstr, keyword string) int {
	out := 0
	for i := 0; i < len(initstr); i++ {
		if NextChars(initstr, i, len(keyword)) == keyword {
			out++
		}
	}
	return out
}

func NextChars(initstr string, start, length int) string {
	out := ""
	for i := start; i < start+length && i < len(initstr); i++ {
		out += string(initstr[i])
	}
	return out
}
