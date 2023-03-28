with open("busines_tax.txt") as f:
    text = f.read()

text = text.replace("\n第", "\n\n第")

with open("busines_tax_split.txt", "w") as f:
    f.write(text)