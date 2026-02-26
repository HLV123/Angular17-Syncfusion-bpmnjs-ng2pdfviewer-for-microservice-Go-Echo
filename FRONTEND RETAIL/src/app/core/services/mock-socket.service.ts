import { Injectable } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

export interface SystemAlert {
    id: string;
    time: string;
    message: string;
    type: 'INFO' | 'WARNING' | 'CRITICAL';
}

@Injectable({
    providedIn: 'root'
})
export class MockSocketService {

    // Real-time stream of alerts
    getAlertStream(): Observable<SystemAlert> {
        return timer(5000, 15000).pipe(
            map(i => {
                const types: ('INFO' | 'WARNING' | 'CRITICAL')[] = ['INFO', 'WARNING', 'CRITICAL'];
                const modules = ['AI Scoring', 'Model Monitor', 'Integration', 'Data Sync'];
                const type = types[Math.floor(Math.random() * types.length)];
                return {
                    id: `ALT-${Date.now().toString().slice(-4)}`,
                    time: new Date().toLocaleTimeString(),
                    message: `Update from ${modules[Math.floor(Math.random() * modules.length)]} system [Event #${i}]`,
                    type: type
                };
            }),
            shareReplay(1)
        );
    }

    // Real-time monitoring metrics
    getMetricStream(): Observable<any> {
        return timer(1000, 3000).pipe(
            map(i => ({
                timestamp: new Date().toLocaleTimeString(),
                latency: Math.floor(40 + Math.random() * 20),
                throughput: Math.floor(300 + Math.random() * 100),
                activeConnections: Math.floor(1200 + Math.random() * 50)
            })),
            shareReplay(1)
        );
    }
}
