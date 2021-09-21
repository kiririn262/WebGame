from django.shortcuts import render
from django.http import HttpResponse
from django.views.generic import View

class IndexView(View):
    """
    インデックスビュー
    """
    def get(self, request, *args, **kwargs):
        # テンプレートのレンダリング
        return render(request, 'touch/index.html')
        
index = IndexView.as_view()