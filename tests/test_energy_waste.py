"""Test file to trigger EcoCompute Energy Auditor."""

from transformers import AutoModelForCausalLM, BitsAndBytesConfig

bnb_config = BitsAndBytesConfig(load_in_8bit=True)

model = AutoModelForCausalLM.from_pretrained(
    "mistralai/Mistral-7B-Instruct-v0.3",
    quantization_config=bnb_config,
    device_map="cuda"
)

for prompt in prompts:
    output = model.generate(tokenizer(prompt, return_tensors="pt").to("cuda"))
