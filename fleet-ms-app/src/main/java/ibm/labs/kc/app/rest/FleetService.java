package ibm.labs.kc.app.rest;

import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.enums.SchemaType;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;

import ibm.labs.kc.dao.DAOFactory;
import ibm.labs.kc.dao.FleetDAO;
import ibm.labs.kc.dto.model.FleetControl;
import ibm.labs.kc.model.Fleet;
import ibm.labs.kc.simulator.FleetSimulator;


@Path("fleets")
public class FleetService {
	
	protected FleetDAO dao;
	protected  FleetSimulator fleetSimulator;
	
	public FleetService() {
		dao = DAOFactory.buildOrGetFleetDAO("Fleet.json");	
		fleetSimulator = new FleetSimulator();
	}
	
	public FleetService(FleetDAO fdao,FleetSimulator fleetSimulator) {
		this.dao = fdao;
		this.fleetSimulator = fleetSimulator;
	}
	
	
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Retrieve all Fleets",description=" Retrieve the fleets defined in the service.")
    @APIResponses(
            value = {
                @APIResponse(
                    responseCode = "200",
                    description = "All fleets from datasource",
                    content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = Fleet[].class))) })
    public List<Fleet> getFleets() {
    	List<Fleet> l = new ArrayList<Fleet>();
    	for (Fleet f : dao.getFleets()) {
    		Fleet nf = new Fleet(f.getName());
    		nf.setId(f.getId());
    		nf.setColor(f.getColor());
    		nf.setShips(null);
    		l.add(nf);
    	}
		return l;
	}

    @GET
	@Path(value="/{fleetName}")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Get fleet by fleet name",description=" Retrieve a fleet with ships from is unique name")
    @APIResponses(
            value = {
            	@APIResponse(
                    responseCode = "404", 
                    description = "fleet not found",
                    content = @Content(mediaType = "text/plain")),
                @APIResponse(
                    responseCode = "200",
                    description = "fleet retrieved",
                    content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = Fleet.class))) })
	public Fleet getFleetByName(
			@Parameter(
		            description = "The fleetname to get ships data",
		            required = true, 
		            example = "KC-NorthFleet", 
		            schema = @Schema(type = SchemaType.STRING)) 
			@PathParam("fleetName") String fleetName) {
		return dao.getFleetByName(fleetName);
	}

    @POST
    @Path(value="/simulate")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Start simulating ship movement within a fleet",description="Start a fleet simulation by moving each ship of the fleet on the see")
    @APIResponses(
            value = {
            	@APIResponse(
                    responseCode = "404", 
                    description = "fleet not found",
                    content = @Content(mediaType = "text/plain")),
                @APIResponse(
                    responseCode = "200",
                    description = "status started",
                    content = @Content(mediaType = "application/json"))
            	})
    public Response simulateFleet(FleetControl ctl) {
    	if ("START".equals(ctl.getCommand().toUpperCase())) {
    		Fleet f = dao.getFleetByName(ctl.getFleetName());
    		getFleetSimulator().start(f,ctl.getNumberOfMinutes());
    		return  Response.ok("{\"status\":\"Started\"}").build();
    	}
       	if ("STOP".equals(ctl.getCommand().toUpperCase())) {
    		Fleet f = dao.getFleetByName(ctl.getFleetName());
    		getFleetSimulator().stop(f);
    		return  Response.ok("{\"status\":\"Stopped\"}").build();
    	}
    	return  Response.ok("{\"status\":\"Nothing done\"}").build();
    }

	public  FleetSimulator getFleetSimulator() {
		return fleetSimulator;
	}
    
}
