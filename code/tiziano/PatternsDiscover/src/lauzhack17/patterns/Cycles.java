package lauzhack17.patterns;

import static com.googlecode.cqengine.query.QueryFactory.between;

import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

import org.apache.commons.lang3.time.DateUtils;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.googlecode.cqengine.resultset.ResultSet;

import lauzhack17.Graph;
import lauzhack17.Graph.Client;
import lauzhack17.Graph.GraphNode;
import lauzhack17.Graph.Transaction;

public class Cycles implements Runnable {

	public static int MAX_DEPTH = 5;
	public static int MAX_HOURS = 24;

	final Graph graph;
	Queue<GraphNode> queue;
	
	PrintWriter writer ;

	public Cycles(Graph g, Queue<GraphNode> queue, PrintWriter writer) {
		this.graph = g;
		this.queue = queue;
		this.writer = writer;
	}

	@Override
	public void run() {

		while (!queue.isEmpty()) {
			GraphNode client = queue.poll();

			if (client != null) {

				for (Transaction ot : client.outgoing) {
					Date upperLimit = DateUtils.addHours(ot.date, MAX_HOURS);
					Queue<Transaction> path = new LinkedList<>();
					path.add(ot);
					visit(path, ot.to, MAX_DEPTH, client, ot.date, upperLimit);
				}

			}
		}

	}

	private void visit(Queue<Transaction> path, GraphNode current, int hops, GraphNode target, Date minDate, Date maxDate) {
		if (hops >= 0)
			if (current.equals(target)) {
				System.out.println(path);
				write(new ArrayList<>(path));
			} else {
				ResultSet<Transaction> results = current.outgoing.retrieve(between(Transaction.DT, minDate, maxDate));
				for (Transaction t : results) {
					path.add(t);
					visit(path, t.to, hops - 1, target, minDate, maxDate);
					path.peek();
				}
			}
	}

	public class PathNode {
		public PathNode(Transaction i, Client c) {
			this.client = c;
			this.incoming = i;
		}

		public Client client;
		public Transaction incoming;
		public Queue<Transaction> notVisited = new LinkedList<>();

		@Override
		public String toString() {
			return "PathNode [incoming=" + incoming + "]";
		}

	}
	

    static Gson gson;
	public synchronized void write(List<Transaction> path) 
	{
		
		if(gson==null) {
			GsonBuilder builder = new GsonBuilder();
		    builder.excludeFieldsWithoutExposeAnnotation();
		    gson = builder.create();
		}
		
		String json = gson.toJson(path);
		writer.println(json);
	}

}
