"""
Test file to trigger EcoCompute Energy Audit.
This code contains intentional energy waste patterns for demo purposes.
"""
from transformers import AutoModelForCausalLM, BitsAndBytesConfig

# CRITICAL: Default INT8 without threshold fix → +17-147% energy waste!
config = BitsAndBytesConfig(
    load_in_8bit=True,  # Missing llm_int8_threshold=0.0
)

model = AutoModelForCausalLM.from_pretrained(
    "mistralai/Mistral-7B-v0.1",
    quantization_config=config,
)

# WARNING: BS=1 loop — up to 95.7% energy waste
prompts = ["Hello", "World", "Test"]
for prompt in prompts:
    output = model.generate(input_ids=prompt, batch_size=1)
