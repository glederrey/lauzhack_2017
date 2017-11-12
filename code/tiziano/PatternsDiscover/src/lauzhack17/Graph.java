package lauzhack17;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import com.google.gson.annotations.Expose;
import com.googlecode.cqengine.ConcurrentIndexedCollection;
import com.googlecode.cqengine.IndexedCollection;
import com.googlecode.cqengine.attribute.Attribute;
import com.googlecode.cqengine.attribute.SimpleAttribute;
import com.googlecode.cqengine.index.navigable.NavigableIndex;
import com.googlecode.cqengine.query.option.QueryOptions;

public class Graph {

	public Map<String, GraphNode> nodes = new HashMap<>();
	public Map<String, Transaction> transactions = new HashMap<>();

	public void addClient(String id, String name, String surname) {
		nodes.put(id, new Client(id, name, surname));
	}

	public void addCompany(String id, String name) {
		nodes.put(id, new Company(id, name));
	}

	public void addTransaction(String id, String from, String to, Date date, float amount) {

		GraphNode source = nodes.get(from);
		GraphNode destination = nodes.get(to);

		if (destination != null && source != null) {
			Transaction t = new Transaction();
			t.id = id;
			t.from = source;
			t.to = destination;
			t.date = date;
			t.amount = amount;
			transactions.put(id, t);
			source.outgoing.add(t);
			destination.incoming.add(t);
		}

	}

	public static class GraphNode {
		public IndexedCollection<Transaction> outgoing = new ConcurrentIndexedCollection<Transaction>();
		IndexedCollection<Transaction> incoming = new ConcurrentIndexedCollection<Transaction>();
		@Expose
		final public String id;
		@Expose
		final public String name;

		public GraphNode(String id, String name) {
			this.id = id;
			this.name = name;
			outgoing.addIndex(NavigableIndex.onAttribute(Transaction.DT));
		}

	}

	public static class Company extends GraphNode {

		public Company(String id, String name) {
			super(id, name);
		}

		@Override
		public String toString() {
			return "Company [name=" + name + "]";
		}
	}

	public static class Client extends GraphNode {

		@Expose
		final public String surname;

		public Client(String id, String name, String surname) {
			super(id, name);
			this.surname = surname;

		}

		@Override
		public String toString() {
			return "Client [name=" + name + ", surname=" + surname + "]";
		}

	}

	public static class Transaction {
		@Expose
		String id;
		@Expose
		GraphNode from;
		@Expose
		public GraphNode to;
		@Expose
		public Date date;
		@Expose
		float amount;
		public static final Attribute<Transaction, Date> DT = new SimpleAttribute<Transaction, Date>("date") {
			public Date getValue(Transaction t, QueryOptions queryOptions) {
				return t.date;
			}
		};

		@Override
		public String toString() {
			return "Transaction [from=" + from + ", to=" + to + ", date=" + date + ", amount=" + amount + "]";
		}

	}
}
