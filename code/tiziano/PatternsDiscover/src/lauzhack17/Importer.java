package lauzhack17;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.text.ParseException;
import java.text.SimpleDateFormat;

public class Importer {
	public static void loadClient(Graph graph) {

		System.out.println("Loading clients...");

		try (BufferedReader br = new BufferedReader(
				new InputStreamReader(new FileInputStream("clients.small.csv"), StandardCharsets.UTF_8))) {
			for (String line; (line = br.readLine()) != null;) {
				String[] row = line.split(",");
				if (row[0].equals("id"))
					continue;
				graph.addClient(row[0], row[1], row[2]);
			}
			System.out.println("Loaded " + graph.nodes.size() + " clients");
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	public static void loadCompanies(Graph graph) {

		System.out.println("Loading companies...");

		try (BufferedReader br = new BufferedReader(
				new InputStreamReader(new FileInputStream("companies.small.csv"), StandardCharsets.UTF_8))) {
			for (String line; (line = br.readLine()) != null;) {
				String[] row = line.split(",");
				if (row[0].equals("id"))
					continue;
				graph.addCompany(row[0], row[2]);
			}
			
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	
	static SimpleDateFormat parser=new SimpleDateFormat("MM/dd/yyyyHH:mm:ss");
	public static void loadTransactions(Graph graph) throws NumberFormatException, ParseException {

		System.out.println("Loading transactions...");

		try (BufferedReader br = new BufferedReader(
				new InputStreamReader(new FileInputStream("transactions.small.csv"), StandardCharsets.UTF_8))) {
			for (String line; (line = br.readLine()) != null;) {
				String[] row = line.split(",");
				if (row[0].equals("id"))
					continue;
				graph.addTransaction(row[0], row[1], row[2], parser.parse(row[3]+row[4]), Float.valueOf(row[5]));
				
			}
			System.out.println("Loaded " + graph.transactions.size() + " transactions");
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
}
