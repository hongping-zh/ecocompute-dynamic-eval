"""Test sample — should trigger multiple audit rules."""
from transformers import AutoModelForCausalLM, BitsAndBytesConfig

# Rule 1: Default INT8 without threshold fix → CRITICAL
bnb_config = BitsAndBytesConfig(
    load_in_8bit=True,
)

model = AutoModelForCausalLM.from_pretrained(
    "mistralai/Mistral-7B-Instruct-v0.3",
    quantization_config=bnb_config,
)

# Rule 3: BS=1 loop → WARNING
prompts = ["Hello", "World", "Test"]
for prompt in prompts:
    output = model.generate(prompt)
