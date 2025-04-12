from transformers import pipeline
from langchain_huggingface import HuggingFacePipeline
from langchain.prompts import PromptTemplate
from transformers.utils.logging import set_verbosity_error
# import torch

set_verbosity_error()

# print(torch.cuda.is_available())
# print(torch.cuda.get_device_name(0))

model = pipeline("text-generation", model="mistralai/Mistral-7B-Instruct-v0.1", device=0, max_length=256, truncation=True)

llm = HuggingFacePipeline(pipeline=model)

template = PromptTemplate.from_template("Explain {topic} in detail for a {age} year old.")

chain = template | llm
topic = input("Topic: ")
age = input("Age: ")
response = chain.invoke({"topic": topic, "age": age})
print(response)

# model = pipeline("summarization", model="facebook/bart-large-cnn")
# text = """
# Nvidia Corporation[a] is an American multinational corporation and technology company headquartered in Santa Clara, California, and incorporated in Delaware.[5] Founded in 1993 by Jensen Huang (president and CEO), Chris Malachowsky, and Curtis Priem, it is a company which designs and supplies graphics processing units (GPUs), application programming interfaces (APIs) for data science and high-performance computing, and system on a chip units (SoCs) for mobile computing and the automotive market. Nvidia is also a leading supplier of artificial intelligence (AI) hardware and software.[6][7] Nvidia outsources the manufacturing of the hardware it designs.[8][9]

# Nvidia's professional line of GPUs are used for edge-to-cloud computing and in supercomputers and workstations for applications in fields such as architecture, engineering and construction, media and entertainment, automotive, scientific research, and manufacturing design.[10] Its GeForce line of GPUs are aimed at the consumer market and are used in applications such as video editing, 3D rendering, and PC gaming. With a market share of 80.2% in the second quarter of 2023,[11] Nvidia leads global sales of discrete desktop GPUs by a wide margin. The company expanded its presence in the gaming industry with the introduction of the Shield Portable (a handheld game console), Shield Tablet (a gaming tablet), and Shield TV (a digital media player), as well as its cloud gaming service GeForce Now.[12]

# In addition to GPU design and outsourcing manufacturing, Nvidia provides the CUDA software platform and API that allows the creation of massively parallel programs which utilize GPUs.[13][14] They are deployed in supercomputing sites around the world.[15][16] In the late 2000s, Nvidia had moved into the mobile computing market, where it produced Tegra mobile processors for smartphones and tablets and vehicle navigation and entertainment systems.[17][18][19] Its competitors include AMD, Intel,[20] Qualcomm,[21] and AI accelerator companies such as Cerebras and Graphcore. It also makes AI-powered software for audio and video processing (e.g., Nvidia Maxine).[22]

# Nvidia's attempt to acquire Arm from SoftBank in September 2020 failed to materialize following extended regulatory scrutiny, leading to the termination of the deal in February 2022 in what would have been the largest semiconductor acquisition.[23][24] In 2023, Nvidia became the seventh public U.S. company to be valued at over $1 trillion,[25] and the company's valuation has increased rapidly since then amid growing demand for data center chips with AI capabilities in the midst of the AI boom.[26][27] In June 2024, for one day, Nvidia overtook Microsoft as the world's most valuable publicly traded company, with a market capitalization of over $3.3 trillion.[28]
# """
# response = model(text)
# print(response)
