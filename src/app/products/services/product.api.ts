import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Category, NewProductPayload, Product, ProductsResponse} from '../models/product.model';


const BASE_URL = "https://dummyjson.com";

@Injectable({providedIn: 'root'})
export class ProductsApi {
  private readonly http = inject(HttpClient);

  getProducts(params?: { limit?: number; skip?: number }): Observable<ProductsResponse> {
    const httpParams = new HttpParams({
      fromObject: {
        ...(params?.limit != null ? {limit: params.limit} : {}),
        ...(params?.skip != null ? {skip: params.skip} : {})
      }
    });
    return this.http.get<ProductsResponse>(`${BASE_URL}/products`, {params: httpParams});
  }

  searchProducts(q: string, params?: { limit?: number; skip?: number }): Observable<ProductsResponse> {
    const httpParams = new HttpParams({
      fromObject: {
        q,
        ...(params?.limit != null ? {limit: params.limit} : {}),
        ...(params?.skip != null ? {skip: params.skip} : {})
      }
    });
    return this.http.get<ProductsResponse>(`${BASE_URL}/products/search`, {params: httpParams});
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${BASE_URL}/products/categories`);
  }

  getProductsByCategory(category: string, params?: { limit?: number; skip?: number }): Observable<ProductsResponse> {
    const httpParams = new HttpParams({
      fromObject: {
        ...(params?.limit != null ? {limit: params.limit} : {}),
        ...(params?.skip != null ? {skip: params.skip} : {}),
      }
    });
    return this.http.get<ProductsResponse>(`${BASE_URL}/products/category/${encodeURIComponent(category)}`, {params: httpParams});
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${BASE_URL}/products/${id}`);
  }

  addProduct(body: NewProductPayload): Observable<Product> {
    return this.http.post<Product>(`${BASE_URL}/products/add`, body);
  }

  deleteProduct(id: number): Observable<unknown> {
    return this.http.delete(`${BASE_URL}/products/${id}`);
  }

}
