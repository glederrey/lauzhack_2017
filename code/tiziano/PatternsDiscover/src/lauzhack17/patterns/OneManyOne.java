package lauzhack17.patterns;

import static com.googlecode.cqengine.query.QueryFactory.between;

import java.io.PrintWriter;
import java.util.Date;
import java.util.HashSet;
import java.util.Queue;
import java.util.Set;

import org.apache.commons.lang3.time.DateUtils;

import com.googlecode.cqengine.attribute.Attribute;
import com.googlecode.cqengine.attribute.SimpleAttribute;
import com.googlecode.cqengine.query.option.QueryOptions;
import com.googlecode.cqengine.resultset.ResultSet;

import lauzhack17.Graph;
import lauzhack17.Graph.GraphNode;
import lauzhack17.Graph.Transaction;

public class OneManyOne implements Runnable {

	public static int MAX_HOURS = 24 * 4;

	final Graph graph;
	Queue<GraphNode> queue;

	PrintWriter writer;

	public OneManyOne(Graph g, Queue<GraphNode> queue, PrintWriter writer) {
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
					System.out.println(ot);
					Set<Path> paths = new HashSet<>();

					GraphNode intermediary = ot.to;

					Date upperLimit = DateUtils.addHours(ot.date, MAX_HOURS);
					ResultSet<Transaction> results = intermediary.outgoing
							.retrieve(between(Transaction.DT, ot.date, upperLimit));

					for (Transaction ot2 : results) {
						Path path = new Path();
						path.intermediary = ot;
						path.destination = ot2;
						paths.add(path);
					}

					Set<GraphNode> destinations = new HashSet<>();
					for (Path p : paths) {
						if (destinations.contains(p)) {
							System.out.println(paths);
						} else
							destinations.add(p.destination.to);
					}

				}

			}
		}

	}

	static class Path {
		public Transaction intermediary;
		public Transaction destination;

		@Override
		public int hashCode() {
			return intermediary.hashCode() + destination.hashCode();
		}

		@Override
		public boolean equals(Object obj) {
			return intermediary.equals(obj) && destination.equals(obj);
		}

		@Override
		public String toString() {
			return "Path [intermediary=" + intermediary + ", destination=" + destination + "]";
		}

	}

}
