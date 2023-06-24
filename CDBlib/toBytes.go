package cdblib

func toBytes(inp string) []byte {
	out := make([]byte, len(inp))
	for i := 0; i < len(inp); i++ {
		out[i] = inp[i]
	}
	return out
}

func UintToBytes(inp uint64) []byte {
	out := make([]byte, 8)

	for i := 0; i < 8; i++ {
		out[i] = byte(inp % 256)
		inp -= uint64(out[i])
		inp = inp / 256
	}

	return out
}

func Up(val, times int) int {
	out := 1
	for i := 0; i < times; i++ {
		out *= val
	}
	return out
}

func ByteToUint(inp []byte) uint64 {
	out := uint64(0)

	for i := 0; i < len(inp); i++ {
		out += uint64(inp[i]) * uint64(Up(256, i))
	}

	return out
}
