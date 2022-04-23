import nltk
# nltk.download('punkt')
from nltk.tokenize import word_tokenize
import sys, json, re
import pandas as pd


# read data from json file
jsonfile = open('./articles_json/similarArticles.json' , 'r')
jsondata = jsonfile.read()

# lines = sys.stdin.readlines()
#     # Since our input would only be having one line, parse our JSON data from that
# print(len(lines))
# for line in lines:
#     print("\n")
#     data = json.loads(line)
#     # print(data)
# df=pd.DataFrame(data)

article_list = []



# parse the data

# this is a dictionary now
parsed_data = json.loads(jsondata)

# size = len(parsed_data) #19

for key, value in parsed_data.items():
    if key != "testindex":
        arti = str(parsed_data[key]['content'])
        article_list.append(arti)

# for i in range(size-1):
#     arti = parsed_data[]
#     print(arti)
test_art_index = int(parsed_data["testindex"])

# finding index of the test article
# test_article_id = parsed_data['testpost']['_id']
# for i in range(len())
# print(test_article)





# for index, row in df.iterrows():
#     # print(row['content'])
#     article_list.append(row['content'])
    
    
# print(article_list)
    
bagofwords = []
#  article list is ready

for art in article_list:
    bagofwords.append(word_tokenize(art))
    

    
stop_words = [' ','','.','i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", "you've", "you'll", "you'd", 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', "she's", 'her', 'hers', 'herself', 'it', "it's", 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', "don't", 'should', "should've", 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', "aren't", 'couldn', "couldn't", 'didn', "didn't", 'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't", 'haven', "haven't", 'isn', "isn't", 'ma', 'mightn', "mightn't", 'mustn', "mustn't", 'needn', "needn't", 'shan', "shan't", 'shouldn', "shouldn't", 'wasn', "wasn't", 'weren', "weren't", 'won', "won't", 'wouldn', "wouldn't"]

# removing stop words for each article
updated_bagofwords = []

for i in bagofwords:
    updated_bagofwords.append([w for w in i if not w.lower() in stop_words])


uniqueWords = []

for i in updated_bagofwords:
    uniqueWords = set(uniqueWords).union(set(i))
    



wordDict_list = [] 
#its length is number of articles

for i in range(len(updated_bagofwords)):
    wordDict_list.append(dict.fromkeys(uniqueWords, 0))

for i in range(len(updated_bagofwords)):
    for word in updated_bagofwords[i]:
        wordDict_list[i][word] += 1



crossDict = pd.DataFrame(wordDict_list)



def computeTF(wordDict, bagOfWords):
    tfDict = {}
    bagOfWordsCount = len(bagOfWords)
    for word, count in wordDict.items():
        tfDict[word] = count / float(bagOfWordsCount)
    return tfDict

tf_list = []

for i in range (len(wordDict_list)):
    tf_list.append(computeTF(wordDict_list[i] , updated_bagofwords[i]))



def computeIDF(documents):
    import math
    N = len(documents)
    
    # initialize the idf dictionary with all words of document
    idfDict = dict.fromkeys(documents[0].keys(), 0)
    
    # this loop will put values (how many times a word occurs in all documents) in idf dictionary for each word of each document
    for document in documents:
        for word, val in document.items():
            if val > 0:
                idfDict[word] += 1
    
    for word, val in idfDict.items():
        idfDict[word] = math.log(N / float(val))
    return idfDict


idfs = computeIDF(wordDict_list)


def computeTFIDF(tfBagOfWords, idfs):
    tfidf = {}
    for word, val in tfBagOfWords.items():
        tfidf[word] = val * idfs[word]
    return tfidf

tfidf_list = []

for i in range (len(tf_list)):
    tfidf_list.append(computeTFIDF(tf_list[i], idfs))

df_final = pd.DataFrame(tfidf_list)


# now use cosine similarity formula to check test article with all these rows


from scipy.spatial.distance import cosine

# to be decided

l = [i for i in range(len(tf_list))]
finald = {}
finald = finald.fromkeys(l)

test_article = df_final.iloc[test_art_index]

for i in range(len(df_final)):
    finald[i] = 1 - cosine(test_article, df_final.iloc[i])
    
# print(finald)

sorted_cosine_scores = sorted(finald.items(), key=lambda x: x[1], reverse=True)

sorted_list = []

for i in range(len(sorted_cosine_scores)):
    # print((sorted_cosine_scores[i][0] ,sorted_cosine_scores[i][1]))
    sorted_list.append(sorted_cosine_scores[i][0])
    
print(sorted_list)
