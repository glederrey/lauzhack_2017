package lauzhack17;

import java.io.PrintWriter;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import lauzhack17.Graph.GraphNode;
import lauzhack17.patterns.Cycles;

public class LoopsDetector {

	public static void main(String[] args) throws Exception {

		Graph graph = new Graph();

		Importer.loadClient(graph);
		Importer.loadTransactions(graph);

		Queue<GraphNode> queue = new ConcurrentLinkedQueue<>();
		queue.addAll(graph.nodes.values());
		System.out.println("Ready");
		PrintWriter writer = new PrintWriter("loops.json", "UTF-8");
		
		ExecutorService executor = Executors.newFixedThreadPool(42);
        for (int i = 0; i < 42; i++) {
            Runnable worker = new Cycles(graph, queue, writer);
            executor.execute(worker);
          }
        executor.shutdown();
        while (!executor.isTerminated()) {
        }
        
        writer.flush();
        
        writer.close();
        
        System.out.println("Finished all threads");

	}

}
