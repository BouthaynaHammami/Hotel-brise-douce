package tn.esprit.chambres_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoomStatusEventDTO implements Serializable {
    private Long roomId;
    private String status;
}
