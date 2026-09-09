from huggingface_hub import hf_hub_download

print("Downloading AI model...")

model_path = hf_hub_download(
    repo_id="rarfileexe/Plant-Disease-Detector",
    filename="model_4_mobilenet_finetuned.keras"
)

print("Model downloaded successfully!")
print("Model location:")
print(model_path)