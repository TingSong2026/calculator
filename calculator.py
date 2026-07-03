import tkinter as tk


class Calculator(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Calculator")
        self.resizable(False, False)

        self.expression = ""
        self.display_var = tk.StringVar(value="0")

        self._build_display()
        self._build_buttons()

    def _build_display(self):
        display = tk.Entry(
            self,
            textvariable=self.display_var,
            font=("Segoe UI", 24),
            justify="right",
            bd=8,
            relief="flat",
            state="readonly",
        )
        display.grid(row=0, column=0, columnspan=4, sticky="nsew", padx=8, pady=8)

    def _build_buttons(self):
        # (label, row, column)
        buttons = [
            ("C", 1, 0), ("(", 1, 1), (")", 1, 2), ("/", 1, 3),
            ("7", 2, 0), ("8", 2, 1), ("9", 2, 2), ("*", 2, 3),
            ("4", 3, 0), ("5", 3, 1), ("6", 3, 2), ("-", 3, 3),
            ("1", 4, 0), ("2", 4, 1), ("3", 4, 2), ("+", 4, 3),
            ("0", 5, 0), (".", 5, 1), ("=", 5, 2),
        ]

        for label, row, col in buttons:
            colspan = 2 if label == "=" else 1
            btn = tk.Button(
                self,
                text=label,
                font=("Segoe UI", 18),
                width=4,
                height=2,
                command=lambda l=label: self.on_click(l),
            )
            btn.grid(
                row=row,
                column=col,
                columnspan=colspan,
                sticky="nsew",
                padx=2,
                pady=2,
            )

        for i in range(4):
            self.grid_columnconfigure(i, weight=1)

    def on_click(self, label):
        if label == "C":
            self.expression = ""
        elif label == "=":
            try:
                self.expression = str(eval(self.expression, {"__builtins__": {}}, {}))
            except Exception:
                self.expression = ""
                self.display_var.set("Error")
                return
        else:
            self.expression += label

        self.display_var.set(self.expression or "0")


if __name__ == "__main__":
    Calculator().mainloop()
