import { Injectable } from '@angular/core';
import { grpc } from '@improbable-eng/grpc-web';
import { Observable, of, delay } from 'rxjs';

/**
 * GrpcService — wraps @improbable-eng/grpc-web for model serving calls.
 *
 * In production, this would make real gRPC-Web calls to:
 *   - Seldon Core (gRPC port 9000) for XGBoost/LightGBM models
 *   - Kubeflow Serving (gRPC port 9001) for TensorFlow/PyTorch models
 *   - Envoy Proxy sits in front and translates gRPC-Web ↔ gRPC
 *
 * Currently returns mock data to allow frontend development without backend.
 */
@Injectable({ providedIn: 'root' })
export class GrpcService {

    // Seldon Core endpoint (via Envoy gRPC-Web proxy)
    private seldonEndpoint = 'https://seldon.cdss.local:8443';
    // Kubeflow Serving endpoint
    private kubeflowEndpoint = 'https://kubeflow.cdss.local:8443';

    /**
     * Call credit risk scoring model via gRPC-Web (Seldon Core).
     * Proto: seldon.proto → SeldonMessage { data: DefaultData { ndarray: number[][] } }
     */
    callCreditRiskModel(features: number[]): Observable<{ score: number; latency: number; model: string; protocol: string }> {
        // In production: grpc.unary(SeldonService.Predict, { request, host: this.seldonEndpoint, ... })
        const mockScore = 650 + Math.floor(Math.random() * 200);
        const mockLatency = 60 + Math.floor(Math.random() * 40);
        return of({
            score: mockScore,
            latency: mockLatency,
            model: 'XGBoost Credit Risk v3.2.1',
            protocol: 'gRPC-Web (Seldon Core)'
        }).pipe(delay(mockLatency));
    }

    /**
     * Call fraud detection model via gRPC-Web (Kubeflow Serving).
     * Proto: kfserving.proto → InferRequest { model_name, inputs: InferTensor[] }
     */
    callFraudModel(transactionData: any): Observable<{ fraudProbability: number; latency: number; model: string; protocol: string }> {
        const mockProb = Math.random() * 0.15;
        const mockLatency = 80 + Math.floor(Math.random() * 60);
        return of({
            fraudProbability: parseFloat(mockProb.toFixed(4)),
            latency: mockLatency,
            model: 'Fraud Detection XGB v2.0.0',
            protocol: 'gRPC-Web (Kubeflow Serving)'
        }).pipe(delay(mockLatency));
    }

    /**
     * Call behavioral scoring model via gRPC-Web (Seldon Core).
     */
    callBehavioralModel(customerId: string): Observable<{ behaviorScore: number; latency: number; model: string; protocol: string }> {
        const mockScore = 500 + Math.floor(Math.random() * 300);
        const mockLatency = 100 + Math.floor(Math.random() * 50);
        return of({
            behaviorScore: mockScore,
            latency: mockLatency,
            model: 'Behavioral Scoring v1.5.3',
            protocol: 'gRPC-Web (Seldon Core)'
        }).pipe(delay(mockLatency));
    }

    /**
     * Call customer segmentation model via REST (PredictionIO / SageMaker).
     * This one uses REST, not gRPC — included here for completeness.
     */
    callSegmentationModel(customerId: string): Observable<{ segment: string; confidence: number; latency: number; model: string; protocol: string }> {
        const segments = ['Premium', 'Standard', 'New', 'At-Risk'];
        const mockLatency = 150 + Math.floor(Math.random() * 100);
        return of({
            segment: segments[Math.floor(Math.random() * segments.length)],
            confidence: parseFloat((0.7 + Math.random() * 0.25).toFixed(3)),
            latency: mockLatency,
            model: 'Segmentation v1.2.0',
            protocol: 'REST (PredictionIO)'
        }).pipe(delay(mockLatency));
    }

    /**
     * Batch scoring — calls all 4 models in parallel (used by AI Scoring pipeline).
     * In production, an Envoy Proxy or API Gateway aggregates these calls.
     */
    batchScore(customerId: string, features: number[]): Observable<any[]> {
        // Returns array of promises — caller should use forkJoin
        return of([
            { source: 'Seldon Core', protocol: 'gRPC', model: 'Credit Risk', status: 'SUCCESS' },
            { source: 'Kubeflow', protocol: 'gRPC', model: 'Fraud Detection', status: 'SUCCESS' },
            { source: 'Seldon Core', protocol: 'gRPC', model: 'Behavioral', status: 'SUCCESS' },
            { source: 'PredictionIO', protocol: 'REST', model: 'Segmentation', status: 'SUCCESS' },
        ]).pipe(delay(200));
    }
}
