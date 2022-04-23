#include<bits/stdc++.h>
using namespace std;


void nextGreater(int* arr, int n){
	stack<int> s;
	for(int i=0; i<n; i++){
		int temp = arr[i];
		if(s.empty()){
			s.push(temp);
		}

		while(s.top() < temp){
			s.pop();
			s.push(temp);
			cout<<s.top();
			
		}
		if(s.top() > temp){
			s.push(temp);
		}
	}
	
	if(!s.empty()){
		int top = s.top();
		s.pop();
		while(!s.empty()){
			int first = s.top();
			if( top > first){
				cout<<top;
				
			} else {
				cout<<"-1";
			}
			s.pop();
		}
		cout<<"-1"; 
	}
	
	
}

int main(){
	int arr[] = {9 , 2, 1 ,4, 7};
	nextGreater(arr, 5);
}
