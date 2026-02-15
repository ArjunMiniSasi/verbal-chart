# Loan Approval Chatbot Project: Instruction File (instruction.md)

This document summarizes the steps taken to develop a machine learning model for real-time loan approval, intended for integration with a chatbot. It covers data preprocessing, model training (Decision Tree and Random Forest), evaluation, and conceptual chatbot integration.

## 1. Problem Statement Overview

The goal is to design and implement a chatbot for ABC Credit that facilitates a real-time loan application process. The chatbot should:
1.  Request necessary applicant information.
2.  Evaluate the application using a background machine learning model.
3.  Return an "Approve" or "Decline" decision instantly.

Key objectives include enhancing customer experience (fast application), achieving high accuracy in loan decisions, providing real-time responses, and logging all interactions. Loans are provided to customers aged between 18 and 60.

## 2. Data Loading

The historical loan application data was loaded from an Excel file `Data_FINAL.xlsx` into a pandas DataFrame named `df_loan_applications`.

**Code (from cell_7ef7c277):**
```python
import pandas as pd

file_path = '/content/sample_data/Data_FINAL.xlsx'

try:
    df_loan_applications = pd.read_excel(file_path)
    print(f"Successfully loaded data from {file_path}. Shape: {df_loan_applications.shape}")
    print("First 5 rows of the DataFrame:")
    display(df_loan_applications.head())
except FileNotFoundError:
    print(f"Error: The file '{file_path}' was not found. Please ensure the file is in the correct directory.")
except Exception as e:
    print(f"An error occurred while loading the Excel file: {e}")
3. Data Preprocessing
This section consolidates all data cleaning and preparation steps to ensure the dataset is suitable for machine learning model training.

Missing Values Check (from cell_3674d3a6): Initially, missing values were identified in Education Level, Emp_Level, Housing_Category, Region_Level, and Loan_Given.

missing_values = df_loan_applications.isnull().sum()
missing_values = missing_values[missing_values > 0]
if not missing_values.empty:
    print("Columns with missing values and their counts:")
    display(missing_values)
else:
    print("No missing values found in the DataFrame.")
Consolidated Preprocessing Steps (based on cell_0a806471):

import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from sklearn.model_selection import train_test_split

# --- Data Preprocessing Steps (consolidated) ---

# Re-ensure dropping rows with missing values in the target variable 'Loan_Given'
if 'Loan_Given' in df_loan_applications.columns and df_loan_applications['Loan_Given'].isnull().any():
    print(f"Original shape before dropping missing 'Loan_Given': {df_loan_applications.shape}")
    df_loan_applications.dropna(subset=['Loan_Given'], inplace=True)
    print(f"Shape after dropping missing 'Loan_Given': {df_loan_applications.shape}")

# 1. Handle missing values in 'Existing_Liabilities' first, then map and convert to int
if 'Existing_Liabilities' in df_loan_applications.columns:
    df_loan_applications['Existing_Liabilities'] = df_loan_applications['Existing_Liabilities'].astype(str).map({'Y': 1, 'N': 0}).fillna(0).astype(int)

# 2. Impute missing categorical values 
categorical_cols_to_impute = ['Education Level', 'Emp_Level', 'Housing_Category', 'Region_Level']
for col in categorical_cols_to_impute:
    if col in df_loan_applications.columns and df_loan_applications[col].isnull().any():
        mode_value = df_loan_applications[col].mode()[0]
        df_loan_applications[col] = df_loan_applications[col].fillna(mode_value)

# 3. Create 'Age' column and drop 'Birth Year'
if 'Birth Year' in df_loan_applications.columns:
    current_year = 2024
    df_loan_applications['Age'] = current_year - df_loan_applications['Birth Year']
    df_loan_applications.drop('Birth Year', axis=1, inplace=True)

# 4. Ensure all categorical columns are explicitly string type before one-hot encoding
potential_categorical_cols = [
    'Education Level',
    'Emp_Level',
    'Housing_Category',
    'Region_Level',
    'Demographic_Category',
    'Marital_Status',
    'Gender',
    'Product_Cate'
]

for col in potential_categorical_cols:
    if col in df_loan_applications.columns:
        df_loan_applications[col] = df_loan_applications[col].astype(str)

# 5. Apply one-hot encoding to identified categorical columns
existing_categorical_cols_to_encode = [col for col in potential_categorical_cols if col in df_loan_applications.columns]
df_encoded = pd.get_dummies(df_loan_applications, columns=existing_categorical_cols_to_encode, drop_first=False)

# 6. Drop 'Cust Id' as it's an identifier and not a feature
if 'Cust Id' in df_encoded.columns:
    df_encoded.drop('Cust Id', axis=1, inplace=True)
4. Model Training and Evaluation
The preprocessed data (df_encoded) was split into training and testing sets. Both Decision Tree and Random Forest classifiers were trained and evaluated.

Data Splitting (from cell_7c72fff3):

# Separate features (X) and target (y)
X = df_encoded.drop('Loan_Given', axis=1)
y = df_encoded['Loan_Given']

# Split the dataset into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print(f"Shape of X_train: {X_train.shape}")
print(f"Shape of X_test: {X_test.shape}")
print(f"Shape of y_train: {y_train.shape}")
print(f"Shape of y_test: {y_test.shape}")
4.1 Decision Tree Classifier (from cell_0a806471 - included in consolidated block)
Code (Partial, full code in preprocessing section):

# Instantiate a Decision Tree Classifier
dt_classifier = DecisionTreeClassifier(random_state=42)

# Train the model on the training data
dt_classifier.fit(X_train, y_train)

# Make predictions on the test set
y_pred_dt = dt_classifier.predict(X_test)

# Evaluate the model's performance
print("Decision Tree Classifier Performance:")
print(f"Accuracy: {accuracy_score(y_test, y_pred_dt):.4f}")
print(f"Precision: {precision_score(y_test, y_pred_dt):.4f}")
print(f"Recall: {recall_score(y_test, y_pred_dt):.4f}")
print(f"F1-Score: {f1_score(y_test, y_pred_dt):.4f}")

# Display Confusion Matrix
cm_dt = confusion_matrix(y_test, y_pred_dt)
print("\nConfusion Matrix:")
display(pd.DataFrame(cm_dt, index=['Actual No Loan', 'Actual Loan'], columns=['Predicted No Loan', 'Predicted Loan']))
Performance Metrics:

Accuracy: 0.8940
Precision: 0.9513
Recall: 0.9358
F1-Score: 0.9435
Confusion Matrix:
               Predicted No Loan  Predicted Loan
Actual No Loan              195             991
Actual Loan                1327           19348
4.2 Random Forest Classifier (from cell_f1b62898)
Code:

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import pandas as pd

# Instantiate a Random Forest Classifier
rf_classifier = RandomForestClassifier(random_state=42)

# Train the model on the training data
rf_classifier.fit(X_train, y_train)

# Make predictions on the test set
y_pred_rf = rf_classifier.predict(X_test)

# Evaluate the model's performance
print("Random Forest Classifier Performance:")
print(f"Accuracy: {accuracy_score(y_test, y_pred_rf):.4f}")
print(f"Precision: {precision_score(y_test, y_pred_rf):.4f}")
print(f"Recall: {recall_score(y_test, y_pred_rf):.4f}")
print(f"F1-Score: {f1_score(y_test, y_pred_rf):.4f}")

# Display Confusion Matrix
cm_rf = confusion_matrix(y_test, y_pred_rf)
print("\nConfusion Matrix:")
display(pd.DataFrame(cm_rf, index=['Actual No Loan', 'Actual Loan'], columns=['Predicted No Loan', 'Predicted Loan']))
Performance Metrics:

Accuracy: 0.9453
Precision: 0.9464
Recall: 0.9987
F1-Score: 0.9719
Confusion Matrix:
               Predicted No Loan  Predicted Loan
Actual No Loan                17            1169
Actual Loan                   26           20649
5. Model Evaluation and Selection (from cell_bf29cc31)
The Random Forest Classifier was selected as the best model due to its superior performance across all evaluation metrics, particularly its remarkably high Recall (0.9987) and F1-Score (0.9719). In a loan approval context, minimizing false negatives (correctly identifying eligible applicants) is crucial for customer satisfaction and business opportunity. While its precision was slightly lower than the Decision Tree, the overall robustness and ability to identify nearly all actual loan approvals make it more suitable for deployment in the chatbot.

6. Conceptual Chatbot Integration and Data Sufficiency Logic (from cell_09af5a37)
The chosen Random Forest model would be integrated into a chatbot to provide real-time loan eligibility checks. The chatbot would need intelligent logic to handle user input and ensure data sufficiency:

6.1. Chatbot Integration and Input to Model
User Interaction: Progressive questioning to collect Loan_Amt, Net_Sal, Age, and other demographics/financial details.
Data Collection & Formatting: Parsing natural language to map to model features. This includes direct mapping for numerical inputs, categorical mapping for one-hot encoding (e.g., 'Married' to Marital_Status_Married: 1), and feature engineering (e.g., Age from Birth Year, 'Y'/'N' to 1/0 for Existing_Liabilities).
Model Input: Constructing a Pandas DataFrame row with features in the correct order and format for the Random Forest model. Missing values for non-mandatory fields would be imputed based on training data statistics.
6.2. Data Sufficiency Logic
Mandatory Fields: A predefined set of critical features (e.g., Net_Sal, Loan_Amt, Age, LTV_Perc, Existing_Liabilities) must be provided by the user for a prediction.
Feature Importance: Leverage the Random Forest's feature importances to prioritize asking for the most impactful missing features.
Prediction Confidence Scores: Use the model's output probabilities. If a prediction is highly confident (P(Loan_Given=1) > 0.95 or < 0.05), a decision can be made. If in a "gray area" (e.g., 0.4 < P(Loan_Given=1) < 0.6), the chatbot requests more information.
Interactive Probing: Engage in an iterative dialogue to gather missing data or clarify ambiguous inputs, then re-evaluate.
6.3. Model Response
Clear Decision: Communicate a confident "Approved" or "Denied" decision.
Request for More Information: If data is insufficient or uncertain, politely request specific additional details.
Guidance: Offer generic guidance for denials without revealing sensitive model details.
This framework ensures a dynamic, user-friendly, and reliable real-time loan eligibility check via the chatbot. ```